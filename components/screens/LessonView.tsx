import React, { useState } from 'react';
import { Lesson } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { generateSpeech } from '../../services/geminiService';
import { decode, decodeAudioData } from '../../utils/audioUtils';

type LessonViewProps = {
  lesson: Lesson;
  onComplete: () => void;
};

const SpeakerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
);

const LessonView: React.FC<LessonViewProps> = ({ lesson, onComplete }) => {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);

  const handlePlaySound = async (text: string, id: number) => {
      if (loadingId || playingId) return;

      setLoadingId(id);
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const audioContext = audioContextRef.current;
        const base64Audio = await generateSpeech(text);
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => setPlayingId(null);
        
        setPlayingId(id);
        source.start(0);

      } catch (error) {
          console.error("Failed to play audio:", error);
          alert("Não foi possível reproduzir o áudio.");
      } finally {
        setLoadingId(null);
      }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-text-primary mb-2">{lesson.title}</h1>
      <span className="inline-block bg-brand-primary/10 text-brand-primary text-sm font-medium px-2 py-1 rounded-full mb-6">
        {lesson.type}
      </span>
      
      <div className="mb-6">
        <div className="aspect-video bg-brand-secondary rounded-lg flex items-center justify-center">
            <div className="w-16 h-16 bg-brand-dark/50 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-primary"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
        </div>
      </div>

      <div className="prose max-w-none mb-6 text-text-secondary">
        {lesson.content.split('\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold text-text-primary mb-3">Frases-Chave e Ênfase (Stress)</h3>
        <ul className="space-y-3">
          {lesson.keyPhrases.map((phrase, index) => (
            <li key={index} className="p-4 bg-brand-secondary rounded-lg flex items-center justify-between">
              <div>
                <p className="text-text-primary">{phrase.phrase}</p>
                <p className="text-sm text-brand-primary stress-text" dangerouslySetInnerHTML={{ __html: phrase.stress }}></p>
              </div>
               <button 
                onClick={() => handlePlaySound(phrase.phrase, index)}
                disabled={!!loadingId || !!playingId}
                className="p-2 rounded-full hover:bg-brand-primary/10 text-brand-accent disabled:text-text-secondary disabled:bg-transparent"
                title="Ouvir frase"
               >
                 {loadingId === index ? <Spinner /> : <SpeakerIcon />}
               </button>
            </li>
          ))}
        </ul>
      </div>

      <Button onClick={onComplete}>Assimilar Agora</Button>
    </Card>
  );
};

export default LessonView;