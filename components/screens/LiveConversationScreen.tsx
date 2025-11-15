import React, { useState, useRef, useEffect } from 'react';
import { LiveServerMessage, LiveSession } from "@google/genai";
import Card from '../common/Card';
import Button from '../common/Button';
import { connectToLiveSession } from '../../services/geminiService';
import { createBlobForLiveAPI, decode, decodeAudioData } from '../../utils/audioUtils';

type Transcription = {
    user: string;
    model: string;
    isFinal: boolean;
};

const LiveConversationScreen: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
    const [transcription, setTranscription] = useState<Transcription>({ user: '', model: '', isFinal: false });
    const [history, setHistory] = useState<Transcription[]>([]);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    // For audio playback
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);

    const connect = async () => {
        setStatus('connecting');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const callbacks = {
                onopen: () => {
                    setStatus('connected');
                    const source = audioContextRef.current!.createMediaStreamSource(stream);
                    mediaStreamSourceRef.current = source;
                    const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlobForLiveAPI(inputData);
                        sessionPromiseRef.current?.then((session) => {
                          session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(audioContextRef.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                   if (message.serverContent?.inputTranscription) {
                        const { text, isFinal } = message.serverContent.inputTranscription;
                        setTranscription(prev => ({ ...prev, user: prev.user + text, isFinal }));
                   }
                   if (message.serverContent?.outputTranscription) {
                        const { text, isFinal } = message.serverContent.outputTranscription;
                        setTranscription(prev => ({ ...prev, model: prev.model + text, isFinal }));
                   }
                   if (message.serverContent?.turnComplete) {
                        setHistory(prev => [...prev, { ...transcription, isFinal: true }]);
                        setTranscription({ user: '', model: '', isFinal: false });
                   }

                   const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                   if (base64Audio && outputAudioContextRef.current) {
                        const ctx = outputAudioContextRef.current;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                        const source = ctx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(ctx.destination);
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                   }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Live session error:', e);
                    setStatus('error');
                    disconnect();
                },
                onclose: () => {
                    disconnect();
                },
            };
            
            sessionPromiseRef.current = connectToLiveSession(callbacks);

        } catch (error) {
            console.error("Failed to connect:", error);
            setStatus('error');
        }
    };

    const disconnect = () => {
        setStatus('idle');
        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
        
        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        audioContextRef.current?.close();

        setTranscription({ user: '', model: '', isFinal: false });
    };

    useEffect(() => {
        return () => {
            disconnect(); // Ensure cleanup on component unmount
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isConnecting = status === 'connecting';
    const isConnected = status === 'connected';

    return (
        <Card className="max-w-3xl mx-auto flex flex-col h-[85vh]">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Conversa ao Vivo com IA</h1>
            <p className="text-text-secondary mb-4 pb-4 border-b border-brand-dark">
                Fale livremente com a IA em tempo real. Pressione "Conectar" para começar.
            </p>
            
            <div className="flex justify-center my-4">
                <Button 
                    onClick={isConnected ? disconnect : connect} 
                    disabled={isConnecting}
                    className={isConnected ? 'bg-red-500 hover:bg-red-700' : ''}
                >
                    {isConnecting && 'Conectando...'}
                    {status === 'idle' && 'Conectar'}
                    {status === 'error' && 'Tentar Novamente'}
                    {isConnected && 'Desconectar'}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-brand-secondary rounded-lg text-text-primary">
                {history.map((turn, index) => (
                    <div key={index} className="mb-4">
                        <p><strong className="text-brand-primary">Você:</strong> {turn.user}</p>
                        <p><strong className="text-feedback-correct">IA:</strong> {turn.model}</p>
                    </div>
                ))}
                {isConnected && (
                    <div>
                         <p><strong className="text-brand-primary">Você:</strong> <span className="text-text-secondary">{transcription.user}</span></p>
                        <p><strong className="text-feedback-correct">IA:</strong> <span className="text-text-secondary">{transcription.model}</span></p>
                    </div>
                )}
                 {!isConnected && history.length === 0 && (
                    <p className="text-center text-text-secondary">O histórico da sua conversa aparecerá aqui.</p>
                 )}
            </div>
        </Card>
    );
};

export default LiveConversationScreen;