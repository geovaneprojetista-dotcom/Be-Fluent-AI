import React, { useState, useRef, useEffect } from 'react';

type IntonationCurveProps = {
  type: 'statement' | 'rising-question' | 'falling-question';
  stressWords: string[];
  sentence: string;
  audioUrl: string;
};

const PlayIcon = ({ disabled }: { disabled: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${disabled ? 'text-text-secondary' : 'text-brand-primary cursor-pointer hover:opacity-80'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IntonationCurve: React.FC<IntonationCurveProps> = ({ type, stressWords, sentence, audioUrl }) => {
  const words = sentence.split(' ');
  const width = 300;
  const height = 50;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const indicatorRef = useRef<SVGCircleElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [initialIndicatorPos, setInitialIndicatorPos] = useState({ cx: 0, cy: height / 2 });

  const getPath = () => {
    let path = `M 0 ${height / 2}`;
    const step = width / (words.length -1 || 1);

    for (let i = 0; i < words.length; i++) {
        const x = i * step;
        let y = height / 2;
        
        if (stressWords.includes(words[i].replace(/[.,?]/g, ''))) {
            y -= 10;
        }

        if (type === 'rising-question') {
            y -= (i / (words.length -1 || 1)) * 15;
        } else if (type === 'statement' || type === 'falling-question') {
            y += (i / (words.length -1 || 1)) * 15;
        }
        
        path += ` L ${x} ${y}`;
    }
    return path;
  };
  
  const pathD = getPath();

  useEffect(() => {
    if (pathRef.current) {
        const startPoint = pathRef.current.getPointAtLength(0);
        setInitialIndicatorPos({ cx: startPoint.x, cy: startPoint.y });
        if (indicatorRef.current) {
            indicatorRef.current.setAttribute('cx', String(startPoint.x));
            indicatorRef.current.setAttribute('cy', String(startPoint.y));
        }
    }
  }, [pathD]);

  const handlePlay = () => {
      if (isPlaying || !audioUrl) return;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setIsPlaying(true);
      audio.play();

      const animate = () => {
          if (audio.paused || audio.ended) {
              setIsPlaying(false);
              if (animationFrameRef.current) {
                  cancelAnimationFrame(animationFrameRef.current);
              }
              // Reset indicator to start
              if (indicatorRef.current && pathRef.current) {
                  const startPoint = pathRef.current.getPointAtLength(0);
                  indicatorRef.current.setAttribute('cx', String(startPoint.x));
                  indicatorRef.current.setAttribute('cy', String(startPoint.y));
              }
              return;
          }

          if (pathRef.current && indicatorRef.current && audio.duration) {
              const path = pathRef.current;
              const pathLength = path.getTotalLength();
              const progress = audio.currentTime / audio.duration;
              const { x, y } = path.getPointAtLength(progress * pathLength);
              indicatorRef.current.setAttribute('cx', String(x));
              indicatorRef.current.setAttribute('cy', String(y));
          }

          animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
  };
  
  // Cleanup effect to stop audio and animation when component unmounts
  useEffect(() => {
    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    };
  }, []);

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <p className="text-sm font-medium text-text-secondary">Entonação e Ritmo:</p>
         <button onClick={handlePlay} disabled={isPlaying} title="Ouvir entonação nativa">
            <PlayIcon disabled={isPlaying} />
        </button>
      </div>
      <div className="p-4 bg-brand-secondary rounded-lg">
        <svg viewBox={`0 -5 ${width} ${height + 10}`} className="w-full">
            <path ref={pathRef} d={pathD} stroke="#778DA9" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            
            <circle ref={indicatorRef} cx={initialIndicatorPos.cx} cy={initialIndicatorPos.cy} r="4" fill="#3A86FF" />
            
             {words.map((word, i) => {
                 const isStressed = stressWords.includes(word.replace(/[.,?]/g, ''));
                 return (
                     <text 
                         key={i} 
                         x={i * (width / (words.length -1 || 1))} 
                         y={height - 5} 
                         textAnchor="middle" 
                         className={`text-xs ${isStressed ? 'font-bold text-brand-primary' : 'text-text-secondary'}`}
                         fill="currentColor"
                     >
                         {word}
                     </text>
                 );
             })}
        </svg>
      </div>
    </div>
  );
};

export default IntonationCurve;