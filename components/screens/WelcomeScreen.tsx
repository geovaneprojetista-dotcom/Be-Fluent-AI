import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

type WelcomeScreenProps = {
  onStart: () => void;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <Card>
        <h1 className="text-4xl font-black text-text-primary mb-4">Bem-vindo(a) ao Be Fluent AI</h1>
        <p className="text-lg text-text-secondary mb-6">Seu professor AI de conversação.<br />Fale inglês com confiança.</p>
        
        <div className="text-left space-y-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-brand-primary">Nosso Método: APA + Treino de Ênfase (Stress)</h2>
            <p className="text-text-secondary mt-1">Combinamos um ciclo de aprendizado comprovado com foco no que torna seu inglês mais natural.</p>
          </div>
          <ul className="list-disc list-inside space-y-2 pl-4 text-text-secondary">
            <li><strong className="font-semibold text-text-primary">Assimilar:</strong> Aprenda novos conceitos com exemplos claros.</li>
            <li><strong className="font-semibold text-text-primary">Praticar:</strong> Treine sua pronúncia com feedback de IA.</li>
            <li><strong className="font-semibold text-text-primary">Aplicar:</strong> Use o que aprendeu em conversas do mundo real.</li>
          </ul>
           <p className="text-text-secondary mt-1">Você vai dominar o 'sentence stress' (ênfase na frase), ritmo e entonação para soar como um falante nativo e construir uma confiança inabalável.</p>
        </div>

        <Button onClick={onStart}>Vamos Começar</Button>
      </Card>
    </div>
  );
};

export default WelcomeScreen;