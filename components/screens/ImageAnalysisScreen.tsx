import React, { useState, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { analyzeImage } from '../../services/geminiService';
import { blobToBase64 } from '../../utils/audioUtils';

const ImageAnalysisScreen: React.FC = () => {
    const [prompt, setPrompt] = useState('Describe this image in detail in English.');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setResult('');
        }
    };

    const handleAnalyze = useCallback(async () => {
        if (!imageFile || !prompt) return;

        setIsLoading(true);
        setResult('');
        try {
            const base64Data = await blobToBase64(imageFile);
            const response = await analyzeImage(base64Data, imageFile.type, prompt);
            setResult(response);
        } catch (error) {
            console.error(error);
            setResult('Ocorreu um erro ao analisar a imagem.');
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, prompt]);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-text-primary">Análise de Imagem com IA</h1>
            
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-text-primary mb-3">1. Envie uma Imagem</h2>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
                        />
                        {imagePreview && (
                            <div className="mt-4 border border-brand-dark rounded-lg p-2">
                                <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-64 object-contain rounded" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text-primary mb-3">2. Faça uma Pergunta</h2>
                         <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={4}
                            placeholder="Ex: Describe this image in English."
                            className="w-full p-3 border border-brand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary bg-brand-light text-text-primary"
                        />
                         <Button onClick={handleAnalyze} disabled={!imageFile || !prompt || isLoading} className="mt-4 w-full">
                            {isLoading ? <Spinner/> : 'Analisar Imagem'}
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

export default ImageAnalysisScreen;