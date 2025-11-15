import React from 'react';
import Card from '../common/Card';

const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-brand-primary"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const FlameIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-brand-primary"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
const TargetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-brand-primary"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;


const ProgressView: React.FC = () => {
  // Mock data
  const pronunciationImprovement = 78; // percentage
  const commonErrors = [
    { word: 'the', issue: 'Som do TH' },
    { word: 'live', issue: 'Vogal curta vs. longa' },
    { word: 'focus', issue: 'Ênfase (stress) da palavra' },
  ];
  const confidenceMap = [
    { day: 'Seg', level: 3 },
    { day: 'Ter', level: 4 },
    { day: 'Qua', level: 3 },
    { day: 'Qui', level: 5 },
    { day: 'Sex', level: 6 },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-text-primary">Seu Relatório de Progresso</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold text-brand-primary mb-3">Precisão da Pronúncia</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90 18 18)">
                <circle
                  className="text-brand-dark" strokeWidth="4" fill="none" stroke="currentColor" cx="18" cy="18" r="16"
                />
                <circle
                  className="text-feedback-correct" strokeWidth="4" strokeDasharray={`${pronunciationImprovement * 100.5 / 100}, 100.5`} strokeLinecap="round" fill="none" stroke="currentColor" cx="18" cy="18" r="16"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-text-primary">{pronunciationImprovement}%</span>
              </div>
            </div>
            <div>
                <p className="text-text-secondary">Ótimo trabalho! Você está mostrando uma melhora significativa na clareza da sua fala.</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-brand-primary mb-3">Estatísticas Gerais</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <p className="text-text-secondary">Horas Praticadas</p>
              <p className="text-2xl font-bold text-text-primary">12.5h</p>
            </div>
            <div className="flex justify-between items-baseline">
              <p className="text-text-secondary">Palavras Assimiladas</p>
              <p className="text-2xl font-bold text-text-primary">240</p>
            </div>
          </div>
        </Card>
      </div>
      
       <Card>
          <h2 className="text-xl font-bold text-brand-primary mb-3">Erros Comuns</h2>
          <p className="text-sm text-text-secondary mb-4">Focar neles vai te ajudar a melhorar mais rápido.</p>
          <ul className="space-y-2">
            {commonErrors.map((error, index) => (
              <li key={index} className="flex justify-between p-2 bg-brand-secondary rounded-lg">
                <span className="font-semibold text-text-primary">{error.word}</span>
                <span className="text-text-secondary">{error.issue}</span>
              </li>
            ))}
          </ul>
        </Card>

       <Card>
          <h2 className="text-xl font-bold text-brand-primary mb-3">Mapa de Confiança (Esta Semana)</h2>
           <div className="flex justify-between items-end h-40 p-4 bg-brand-secondary rounded-lg">
                {confidenceMap.map(item => (
                    <div key={item.day} className="flex flex-col items-center w-1/6">
                        <div 
                            className="w-1/2 bg-brand-accent rounded-t-md transition-all duration-500 hover:opacity-80" 
                            style={{ height: `${item.level * 15}%` }}
                            title={`Confiança: ${item.level}/10`}
                        ></div>
                        <span className="text-sm mt-2 text-text-secondary">{item.day}</span>
                    </div>
                ))}
           </div>
       </Card>
       
       <Card>
            <h2 className="text-xl font-bold text-brand-primary mb-4">Conquistas</h2>
            <div className="flex justify-around items-center">
                <div className="flex flex-col items-center text-center">
                    <FlameIcon />
                    <p className="mt-2 font-semibold text-text-primary">Maratona</p>
                    <p className="text-xs text-text-secondary">5 dias seguidos</p>
                </div>
                 <div className="flex flex-col items-center text-center">
                    <StarIcon />
                    <p className="mt-2 font-semibold text-text-primary">Falante</p>
                    <p className="text-xs text-text-secondary">1 hora de prática</p>
                </div>
                 <div className="flex flex-col items-center text-center">
                    <TargetIcon />
                    <p className="mt-2 font-semibold text-text-primary">Preciso</p>
                    <p className="text-xs text-text-secondary">+90% de precisão</p>
                </div>
            </div>
       </Card>
    </div>
  );
};

export default ProgressView;