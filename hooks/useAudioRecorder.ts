import { useState, useRef, useCallback } from 'react';

type RecorderControls = {
  recordingStatus: 'inactive' | 'recording' | 'paused';
  startRecording: () => void;
  stopRecording: () => Promise<{ audioUrl: string | null; audioBlob: Blob | null }>;
  audioUrl: string | null;
};

export const useAudioRecorder = (): RecorderControls => {
  const [recordingStatus, setRecordingStatus] = useState<'inactive' | 'recording' | 'paused'>('inactive');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setRecordingStatus('recording');
      // Use a more common mimetype if available
      const options = { mimeType: 'audio/webm;codecs=opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.log(`${options.mimeType} is not Supported`);
          delete options.mimeType;
      }
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        stream.getTracks().forEach(track => track.stop()); // Stop microphone access
      };
      
      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setRecordingStatus('inactive');
    }
  }, []);

  const stopRecording = useCallback((): Promise<{ audioUrl: string | null; audioBlob: Blob | null }> => {
    return new Promise((resolve) => {
        if (mediaRecorderRef.current && recordingStatus === 'recording') {
            mediaRecorderRef.current.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/wav' });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
                audioChunksRef.current = [];
                resolve({ audioUrl: url, audioBlob });
            }, { once: true });
            
            mediaRecorderRef.current.stop();
            setRecordingStatus('inactive');
        } else {
            resolve({ audioUrl: null, audioBlob: null });
        }
    });
  }, [recordingStatus]);

  return { recordingStatus, startRecording, stopRecording, audioUrl };
};