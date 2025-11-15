import React, { useState, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { analyzeVideo } from '../../services/geminiService';
import { blobToBase64 } from '../../utils/audioUtils';

const VideoAnalysisScreen: React.FC = () => {
    const [prompt, setPrompt] = useState('What is happening in this video? Describe it in English.');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 20 * 1024 * 1024) { // 20 MB limit
                alert("Por favor, selecione um vídeo com menos de 20MB.");
                return;
            }
            setVideoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setVideoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setResult('');
        }
    };

    const handleAnalyze = useCallback(async () => {
        if (!videoFile || !prompt) return;

        setIsLoading(true);
        setResult('');
        try {
            const base64Data = await blobToBase64(videoFile);
            const response = await analyzeVideo(base64Data, videoFile.type, prompt);
            setResult(response);
        } catch (error) {
            console.error(error);
            setResult('Ocorreu um erro ao analisar o vídeo.');
        } finally {
            setIsLoading(false);
        }
    }, [videoFile, prompt]);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-text-primary">Análise de Vídeo com IA</h1>
            
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-text-primary mb-3">1. Envie um Vídeo (máx 20MB)</h2>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
                        />
                        {videoPreview && (
                            <div className="mt-4 border border-brand-dark rounded-lg p-2">
                                <video src={videoPreview} controls className="w-full h-auto max-h-64 rounded" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text-primary mb-3">2. Faça uma Pergunta</h2>
                         <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={4}
                            placeholder="Ex: What is happening in this video?"
                            className="w-full p-3 border border-brand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary bg-brand-light text-text-primary"
                        />
                         <Button onClick={handleAnalyze} disabled={!videoFile || !prompt || isLoading} className="mt-4 w-full">
                            {isLoading ? <Spinner/> : 'Analisar Vídeo'}
                        </Button>
                    </div>
                </div>
            </Card>

            {result && (
                <Card>
                    <h2 className="text-xl font-bold text-text-primary mb-3">Resultado da Análise</h2>
                    <div className="p-4 bg-brand-secondary rounded-lg whitespace-pre-wrap">
                        <p className="text-text-primary">{result}</p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default VideoAnalysisScreen;