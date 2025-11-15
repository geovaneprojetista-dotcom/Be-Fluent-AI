import React, { useState, useRef, useEffect } from 'react';
import { Conversation, ChatMessage } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { getConversationResponse, transcribeAudio } from '../../services/geminiService';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';

type ConversationViewProps = {
  conversation: Conversation;
  onComplete: () => void;
};

const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
);


const ConversationView: React.FC<ConversationViewProps> = ({ conversation, onComplete }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
      {
        sender: 'ai',
        text: `Olá! Vamos praticar. Lembre-se, cada conversa é uma oportunidade para aprender, não um teste. Estou aqui para ajudar. Pode começar.`
      }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const { recordingStatus, startRecording, stopRecording } = useAudioRecorder();

  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);
    const textToSend = userInput;
    setUserInput('');
    setIsLoading(true);

    try {
      const aiResponse = await getConversationResponse(newMessages, conversation.aiPersona, textToSend);
      setMessages([...newMessages, { sender: 'ai', text: aiResponse }]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { sender: 'ai', text: "Desculpe, encontrei um erro. Você poderia repetir?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = async () => {
    if (recordingStatus === 'recording') {
        const { audioBlob } = await stopRecording();
        if (audioBlob) {
            setIsTranscribing(true);
            try {
                const transcript = await transcribeAudio(audioBlob);
                setUserInput(transcript);
            } catch (error) {
                console.error(error);
                alert("Não foi possível transcrever o áudio. Tente novamente.");
            } finally {
                setIsTranscribing(false);
            }
        }
    } else {
        setUserInput('');
        startRecording();
    }
  };

  const isMicActive = recordingStatus === 'recording' || isTranscribing;

  return (
    <Card className="max-w-3xl mx-auto flex flex-col h-[85vh]">
      <h1 className="text-2xl font-bold text-text-primary mb-2">{conversation.title}</h1>
      <p className="text-text-secondary mb-4 pb-4 border-b border-brand-dark">
        <strong>Cenário:</strong> {conversation.scenario}
      </p>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-sm px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-brand-primary text-brand-secondary rounded-br-none' : 'bg-brand-dark text-text-primary rounded-bl-none'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="max-w-sm px-4 py-2 rounded-2xl bg-brand-dark text-text-primary rounded-bl-none">
                     <Spinner/>
                 </div>
            </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-brand-dark flex items-center gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={isMicActive ? "Gravando..." : "Digite ou fale sua resposta..."}
          className="flex-1 px-4 py-2 border border-brand-dark rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary bg-brand-light text-text-primary"
          disabled={isLoading || isMicActive}
        />
        <button onClick={handleMicClick} disabled={isLoading} className={`p-3 rounded-full transition-colors ${recordingStatus === 'recording' ? 'bg-red-500 text-white animate-pulse' : 'bg-brand-dark text-text-primary hover:opacity-90'}`}>
            {isTranscribing ? <Spinner/> : <MicIcon/>}
        </button>
        <Button onClick={handleSendMessage} disabled={isLoading || isMicActive || !userInput} className="rounded-full">Enviar</Button>
      </div>
    </Card>
  );
};

export default ConversationView;