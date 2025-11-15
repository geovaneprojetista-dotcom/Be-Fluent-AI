import React from 'react';
import { UserProfile, Screen } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { DUMMY_LESSONS, DUMMY_PRACTICE_SESSIONS, DUMMY_CONVERSATIONS } from '../../constants';

type DashboardProps = {
  userProfile: UserProfile | null;
  onViewLesson: (id: number) => void;
  onStartPractice: (id: number) => void;
  onStartConversation: (id: number) => void;
  navigate: (screen: Screen) => void;
};

const toolIconMap: { [key in Screen]?: React.ReactElement } = {
    [Screen.Confidence]: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
    ),
    [Screen.ImageAnalysis]: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
    ),
    [Screen.VideoAnalysis]: (
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
    ),
    [Screen.Tutor]: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/></svg>
    ),
    [Screen.Chatbot]: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    ),
};
  
const ToolCard = ({ screen, label, navigate }: { screen: Screen, label: string, navigate: () => void }) => (
    <button onClick={navigate} className="p-4 bg-brand-secondary rounded-lg flex flex-col items-center justify-center text-center hover:bg-brand-dark transition-colors">
        <div className="text-brand-accent mb-2">{toolIconMap[screen]}</div>
        <span className="font-medium text-sm text-text-primary">{label}</span>
    </button>
);


const Dashboard: React.FC<DashboardProps> = ({ userProfile, onViewLesson, onStartPractice, onStartConversation, navigate }) => {
  const dailyProgress = 65; // Mock data

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black text-text-primary">
        Bem-vindo(a) de volta, {userProfile?.name || 'aluno(a)'}!
      </h1>

      <Card>
        <h3 className="text-lg font-bold text-text-primary mb-2">Progresso Diário</h3>
        <p className="text-sm text-text-secondary mb-3">Você está quase lá! Continue assim.</p>
        <div className="w-full bg-brand-dark rounded-full h-2.5">
            <div 
                className="bg-brand-primary h-2.5 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${dailyProgress}%` }}
            ></div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Assimilate */}
        <Card>
          <h2 className="text-xl font-bold text-brand-primary mb-1">1. Assimilar</h2>
          <p className="text-sm text-text-secondary mb-4">Aprenda novas frases e regras de pronúncia.</p>
          <div className="space-y-3">
            {DUMMY_LESSONS.map(lesson => (
              <div key={lesson.id} className="p-3 bg-brand-secondary rounded-lg flex justify-between items-center text-text-primary">
                <span className="font-medium">{lesson.title}</span>
                <Button onClick={() => onViewLesson(lesson.id)} variant="secondary" className="px-3 py-1 text-sm">Ver</Button>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Practice */}
        <Card>
          <h2 className="text-xl font-bold text-brand-accent mb-1">2. Praticar</h2>
          <p className="text-sm text-text-secondary mb-4">Treine sua fala com feedback de IA.</p>
           <div className="space-y-3">
            {DUMMY_PRACTICE_SESSIONS.map(session => (
              <div key={session.id} className="p-3 bg-brand-secondary rounded-lg flex justify-between items-center text-text-primary">
                <span className="font-medium">{session.title}</span>
                <Button onClick={() => onStartPractice(session.id)} variant="secondary" className="px-3 py-1 text-sm">Iniciar</Button>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Apply */}
        <Card>
          <h2 className="text-xl font-bold text-feedback-correct mb-1">3. Aplicar</h2>
          <p className="text-sm text-text-secondary mb-4">Use seu inglês em conversas.</p>
           <div className="space-y-3">
            {DUMMY_CONVERSATIONS.map(convo => (
              <div key={convo.id} className="p-3 bg-brand-secondary rounded-lg flex justify-between items-center text-text-primary">
                <span className="font-medium">{convo.title}</span>
                <Button onClick={() => onStartConversation(convo.id)} variant="secondary" className="px-3 py-1 text-sm">Conversar</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-text-primary mb-4">Ferramentas IA</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ToolCard screen={Screen.Confidence} label="Confiança" navigate={() => navigate(Screen.Confidence)} />
          <ToolCard screen={Screen.Tutor} label="Tutor IA" navigate={() => navigate(Screen.Tutor)} />
          <ToolCard screen={Screen.Chatbot} label="Chatbot" navigate={() => navigate(Screen.Chatbot)} />
          <ToolCard screen={Screen.ImageAnalysis} label="Análise Imagem" navigate={() => navigate(Screen.ImageAnalysis)} />
          <ToolCard screen={Screen.VideoAnalysis} label="Análise Vídeo" navigate={() => navigate(Screen.VideoAnalysis)} />
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;