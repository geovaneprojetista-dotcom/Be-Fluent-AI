import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const ConfidenceView: React.FC = () => {
    const [journalEntry, setJournalEntry] = useState('');
    const [savedEntries, setSavedEntries] = useState<string[]>([]);
    
    const handleSaveEntry = () => {
        if (journalEntry.trim()) {
            setSavedEntries([journalEntry, ...savedEntries]);
            setJournalEntry('');
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-black text-text-primary">Sua Trilha de Confiança</h1>
            
            <Card>
                <h2 className="text-xl font-bold text-brand-primary mb-3">Sua Confiança Atual</h2>
                <div className="w-full bg-brand-dark rounded-full h-4">
                    <div 
                        className="bg-gradient-to-r from-brand-accent to-feedback-correct h-4 rounded-full transition-all duration-500"
                        style={{ width: `70%` }} // Mock value
                    ></div>
                </div>
                 <p className="text-sm text-text-secondary mt-2 text-right">Nível: Confiante</p>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-brand-primary mb-3">Micro-desafio de Hoje</h2>
                <p className="text-text-secondary mb-4">Grave a si mesmo dizendo "Hello, how are you today?" três vezes. Foque em se sentir relaxado, não em ser perfeito. Este é um espaço seguro.</p>
                <div className="p-4 bg-brand-secondary rounded-lg">
                    <p className="font-display font-semibold text-text-primary text-center text-lg">"O especialista em qualquer coisa já foi um iniciante."</p>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-brand-primary mb-3">Diário de Progresso Emocional</h2>
                <p className="text-text-secondary mb-4">Como você se sentiu durante sua prática hoje? Que pensamentos surgiram? Escrevê-los pode te ajudar a entender e superar seus medos.</p>
                <textarea
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    rows={5}
                    placeholder="Hoje eu me senti..."
                    className="w-full p-3 border border-brand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary bg-brand-light text-text-primary"
                />
                <div className="mt-4">
                    <Button onClick={handleSaveEntry}>Salvar Registro</Button>
                </div>
            </Card>

             {savedEntries.length > 0 && (
                <Card>
                    <h3 className="text-lg font-bold text-text-primary mb-3">Registros Anteriores</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {savedEntries.map((entry, index) => (
                             <div key={index} className="p-3 bg-brand-secondary rounded-lg">
                                <p className="text-text-secondary">{entry}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ConfidenceView;