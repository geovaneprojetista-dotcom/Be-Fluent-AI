import React, { useState, useEffect, useRef } from 'react';
import { PracticeSession, Feedback, PronunciationFeedback, ShadowingFeedback, StressFeedback, FreestyleFeedback } from '../../types';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { getPronunciationFeedback, transcribeAudio, getShadowingFeedback, getStressFeedback, getFreestyleFeedback } from '../../services/geminiService';
import Card from '../common/Card';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import IntonationCurve from '../common/IntonationCurve';

type PracticeViewProps = {
  practiceSession: PracticeSession;
  onComplete: () => void;
};

type PracticeMode = 'classic' | 'shadowing' | 'stress' | 'freestyle';

const PROGRESS_STORAGE_KEY = 'beFluentPracticeProgress';

const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
);

const SpeakerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
);

const RestartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
);


const PracticeView: React.FC<PracticeViewProps> = ({ practiceSession, onComplete }) => {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('classic');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { recordingStatus, startRecording, stopRecording } = useAudioRecorder();
  
  // Load progress when the component mounts
  useEffect(() => {
    try {
      const savedProgressRaw = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (savedProgressRaw) {
        const savedProgress = JSON.parse(savedProgressRaw);
        const sessionProgress = savedProgress[practiceSession.id];
        if (sessionProgress && typeof sessionProgress === 'number' && sessionProgress < practiceSession.sentences.length) {
          setCurrentSentenceIndex(sessionProgress);
        }
      }
    } catch (error) {
      console.error("Failed to load practice progress:", error);
    }
  }, [practiceSession.id, practiceSession.sentences.length]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const currentSentence = practiceSession.sentences[currentSentenceIndex];

  const handleRecord = async () => {
    if (recordingStatus === 'recording') {
      setIsLoading(true);
      const { audioBlob } = await stopRecording();
      if (audioBlob) {
        try {
          if (practiceMode === 'classic') {
            const transcript = await transcribeAudio(audioBlob);
            setTranscribedText(transcript);
            const feedbackResult = await getPronunciationFeedback(currentSentence.text, transcript);
            setFeedback(feedbackResult);
          } else if (practiceMode === 'shadowing') {
            const feedbackResult = await getShadowingFeedback(currentSentence.audioNormalUrl, audioBlob, currentSentence.text);
            setFeedback(feedbackResult);
          } else if (practiceMode === 'stress') {
            const feedbackResult = await getStressFeedback(currentSentence.text, audioBlob);
            setFeedback(feedbackResult);
          } else { // Freestyle mode
            const feedbackResult = await getFreestyleFeedback(audioBlob, practiceSession.freestyleTopic);
            setFeedback(feedbackResult);
          }
        } catch (error) {
          console.error(error);
          alert("Falha ao obter feedback. Tente novamente.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    } else {
      setFeedback(null);
      setTranscribedText('');
      startRecording();
    }
  };
  
  const saveProgress = (nextIndex: number | null) => {
    try {
        const savedProgressRaw = localStorage.getItem(PROGRESS_STORAGE_KEY);
        const savedProgress = savedProgressRaw ? JSON.parse(savedProgressRaw) : {};
        
        if (nextIndex === null) {
            delete savedProgress[practiceSession.id];
        } else {
            savedProgress[practiceSession.id] = nextIndex;
        }

        if (Object.keys(savedProgress).length === 0) {
            localStorage.removeItem(PROGRESS_STORAGE_KEY);
        } else {
            localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(savedProgress));
        }
    } catch (error) {
        console.error("Failed to save practice progress:", error);
    }
  };
  
  const handleNext = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
    }
    setFeedback(null);
    setTranscribedText('');
    
    if (practiceMode === 'freestyle') {
        saveProgress(null);
        onComplete();
        return;
    }

    if (currentSentenceIndex < practiceSession.sentences.length - 1) {
      const nextIndex = currentSentenceIndex + 1;
      saveProgress(nextIndex);
      setCurrentSentenceIndex(nextIndex);
    } else {
      saveProgress(null); // Clear progress on completion
      onComplete();
    }
  };

  const handleRestart = () => {
    if (window.confirm('Tem certeza de que deseja reiniciar esta sessão de prática? Seu progresso será perdido.')) {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsAudioPlaying(false);
        }
        setFeedback(null);
        setTranscribedText('');
        setCurrentSentenceIndex(0);
        saveProgress(null);
    }
  };
  
  const playAudio = (url: string) => {
    if (audioRef.current) {
        audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onplay = () => setIsAudioPlaying(true);
    audio.onended = () => {
        setIsAudioPlaying(false);
        audioRef.current = null;
    };
    audio.onerror = () => {
        console.error("Error playing audio.");
        setIsAudioPlaying(false);
        audioRef.current = null;
    }
    audio.play();
  };

  const isPronunciationFeedback = (fb: Feedback | null): fb is PronunciationFeedback => fb !== null && 'score' in fb;
  const isShadowingFeedback = (fb: Feedback | null): fb is ShadowingFeedback => fb !== null && 'similarityScore' in fb;
  const isStressFeedback = (fb: Feedback | null): fb is StressFeedback => fb !== null && 'annotatedSentence' in fb;
  const isFreestyleFeedback = (fb: Feedback | null): fb is FreestyleFeedback => fb !== null && 'overallFeedback' in fb;

  const renderAnnotatedSentence = (text: string) => {
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-primary font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-feedback-incorrect font-semibold not-italic">$1</em>');
    return <p className="text-lg text-text-primary" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <div className="flex justify-between items-start mb-4">
        <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">{practiceSession.title}</h1>
             {practiceMode !== 'freestyle' && (
                <p className="text-text-secondary">Frase {currentSentenceIndex + 1} de {practiceSession.sentences.length}</p>
            )}
        </div>
        <button 
            onClick={handleRestart}
            className="p-2 rounded-full text-text-secondary hover:bg-brand-dark hover:text-text-primary transition-colors"
            title="Reiniciar Prática"
        >
            <RestartIcon />
        </button>
      </div>

       {/* Mode Toggle */}
      <div className="flex justify-center mb-6 bg-brand-secondary p-1 rounded-full">
        <button
          onClick={() => setPracticeMode('classic')}
          className={`px-4 py-2 text-sm font-semibold rounded-full w-1/4 transition-colors ${practiceMode === 'classic' ? 'bg-brand-primary text-brand-secondary shadow' : 'text-text-secondary'}`}
        >
          Clássico
        </button>
        <button
          onClick={() => setPracticeMode('shadowing')}
          className={`px-4 py-2 text-sm font-semibold rounded-full w-1/4 transition-colors ${practiceMode === 'shadowing' ? 'bg-brand-primary text-brand-secondary shadow' : 'text-text-secondary'}`}
        >
          Shadowing
        </button>
        <button
          onClick={() => setPracticeMode('stress')}
          className={`px-4 py-2 text-sm font-semibold rounded-full w-1/4 transition-colors ${practiceMode === 'stress' ? 'bg-brand-primary text-brand-secondary shadow' : 'text-text-secondary'}`}
        >
          Ênfase
        </button>
        <button
          onClick={() => setPracticeMode('freestyle')}
          className={`px-4 py-2 text-sm font-semibold rounded-full w-1/4 transition-colors ${practiceMode === 'freestyle' ? 'bg-brand-primary text-brand-secondary shadow' : 'text-text-secondary'}`}
        >
          Livre
        </button>
      </div>
      
       <div className="text-center text-sm text-text-secondary mb-4 h-10 flex items-center justify-center">
        {practiceMode === 'classic' && 'Leia a frase em voz alta e grave sua pronúncia.'}
        {practiceMode === 'shadowing' && 'Ouça a frase e repita-a imediatamente após ouvir.'}
        {practiceMode === 'stress' && 'Leia a frase focando em enfatizar as palavras corretas.'}
        {practiceMode === 'freestyle' && 'Fale livremente sobre o tópico e receba feedback sobre sua fluência.'}
      </div>


      <Card className="bg-brand-secondary mb-6">
        {practiceMode === 'freestyle' ? (
            <div className="text-center">
                <p className="text-sm font-semibold text-brand-primary mb-2">TÓPICO</p>
                <p className="text-2xl font-serif text-text-primary">
                    {practiceSession.freestyleTopic}
                </p>
            </div>
        ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="flex-1 text-2xl text-center sm:text-left font-serif text-text-primary">
                    {currentSentence.text}
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Button onClick={() => playAudio(currentSentence.audioSlowUrl)} variant="secondary" className="flex items-center gap-2 text-sm !px-3 !py-2" disabled={isAudioPlaying}>
                        <SpeakerIcon /> Lento
                    </Button>
                    <Button onClick={() => playAudio(currentSentence.audioNormalUrl)} variant="secondary" className="flex items-center gap-2 text-sm !px-3 !py-2" disabled={isAudioPlaying}>
                        <SpeakerIcon /> Normal
                    </Button>
                </div>
            </div>
        )}
      </Card>
      
      <div className="flex justify-center items-center gap-4 mb-6">
        <Button onClick={handleRecord} disabled={isLoading || isAudioPlaying} className={`flex items-center gap-2 ${recordingStatus === 'recording' ? 'animate-pulse !shadow-glow' : ''}`}>
            <MicIcon/> {recordingStatus === 'recording' ? (isLoading ? 'Analisando...' : 'Parar Gravação') : 'Gravar'}
        </Button>
      </div>

      {isLoading && <Spinner />}

      {isPronunciationFeedback(feedback) && transcribedText && !isLoading && (
        <div className="text-center my-4 p-2 bg-brand-secondary rounded">
          <p className="text-sm text-text-secondary">O que ouvimos:</p>
          <p className="text-text-primary">"{transcribedText}"</p>
        </div>
      )}

      {feedback && !isLoading && (
        <div className="mt-6 p-4 border-t border-brand-dark">
          <h3 className="text-xl font-bold mb-4 text-center text-text-primary">Feedback</h3>
          
          {isPronunciationFeedback(feedback) && (
            <>
                <div className="flex items-center justify-center mb-4">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-brand-secondary text-3xl font-bold ${feedback.score > 80 ? 'bg-feedback-correct' : feedback.score > 50 ? 'bg-feedback-neutral' : 'bg-feedback-incorrect'}`}>
                        {feedback.score}%
                    </div>
                </div>
                {feedback.mistakes.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-bold text-text-primary">Áreas para melhorar:</h4>
                        <ul className="list-disc list-inside mt-2 space-y-2">
                            {feedback.mistakes.map((mistake, i) => (
                                <li key={i} className="text-text-secondary">{mistake.feedback}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {feedback.mistakes.length === 0 && (
                    <p className="text-center text-feedback-correct font-semibold">Pronúncia excelente!</p>
                )}
                 <IntonationCurve 
                    type={feedback.intonationType} 
                    stressWords={feedback.stressWords} 
                    sentence={currentSentence.text} 
                    audioUrl={currentSentence.audioNormalUrl}
                />
            </>
          )}

          {isShadowingFeedback(feedback) && (
             <>
                <div className="flex items-center justify-center mb-4">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-brand-secondary text-3xl font-bold ${feedback.similarityScore > 80 ? 'bg-feedback-correct' : feedback.similarityScore > 50 ? 'bg-feedback-neutral' : 'bg-feedback-incorrect'}`}>
                        {feedback.similarityScore}%
                    </div>
                     <p className='ml-4 text-text-secondary font-semibold'>Similaridade</p>
                </div>
                 <div className="mb-4">
                    <h4 className="font-bold text-text-primary">Pontos de Feedback:</h4>
                    <ul className="list-disc list-inside mt-2 space-y-2">
                        {feedback.feedbackPoints.map((point, i) => (
                            <li key={i} className="text-text-secondary">{point}</li>
                        ))}
                    </ul>
                 </div>
                 <IntonationCurve 
                    type={feedback.intonationType} 
                    stressWords={feedback.stressWords} 
                    sentence={currentSentence.text} 
                    audioUrl={currentSentence.audioNormalUrl}
                />
             </>
          )}
          
          {isStressFeedback(feedback) && (
             <>
                <div className="mb-4 text-center">
                    <h4 className="font-bold text-text-primary mb-2">Análise da Ênfase:</h4>
                    <div className="p-3 bg-brand-secondary rounded-lg">
                       {renderAnnotatedSentence(feedback.annotatedSentence)}
                    </div>
                </div>
                 <div className="mb-4">
                    <h4 className="font-bold text-text-primary">Dicas da IA:</h4>
                    <ul className="list-disc list-inside mt-2 space-y-2">
                        {feedback.feedbackPoints.map((point, i) => (
                            <li key={i} className="text-text-secondary">{point}</li>
                        ))}
                    </ul>
                 </div>
                 <IntonationCurve 
                    type={feedback.intonationType} 
                    stressWords={feedback.stressWords} 
                    sentence={currentSentence.text} 
                    audioUrl={currentSentence.audioNormalUrl}
                />
             </>
          )}

          {isFreestyleFeedback(feedback) && (
            <>
                <div className="mb-4">
                    <h4 className="font-bold text-text-primary mb-2">Sua Resposta (Transcrição):</h4>
                    <div className="p-3 bg-brand-secondary rounded-lg italic text-text-primary">
                        "{feedback.transcription}"
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-bold text-text-primary">Dicas de Vocabulário:</h4>
                        <ul className="list-disc list-inside mt-2 space-y-2">
                            {feedback.vocabularyFeedback.map((point, i) => (
                                <li key={i} className="text-text-secondary">{point}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-text-primary">Dicas de Gramática:</h4>
                        <ul className="list-disc list-inside mt-2 space-y-2">
                            {feedback.grammarFeedback.map((point, i) => (
                                <li key={i} className="text-text-secondary">{point}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-4">
                    <h4 className="font-bold text-text-primary">Feedback Geral:</h4>
                    <p className="text-text-secondary mt-2">{feedback.overallFeedback}</p>
                </div>
            </>
          )}
        </div>
      )}

      {feedback && !isLoading && (
         <div className="mt-8 text-center">
            <Button onClick={handleNext}>
                {practiceMode === 'freestyle' 
                    ? 'Concluir Sessão'
                    : currentSentenceIndex < practiceSession.sentences.length - 1 
                        ? 'Próxima Frase' 
                        : 'Finalizar Prática'}
            </Button>
         </div>
      )}
    </Card>
  );
};

export default PracticeView;