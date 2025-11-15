import React from 'react';
import { Screen } from '../types';

type SidebarProps = {
  currentScreen: Screen;
  navigate: (screen: Screen) => void;
};

const iconMap: { [key in Screen]?: React.ReactElement } = {
    [Screen.Dashboard]: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
    ),
    [Screen.Progress]: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
    ),
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
    [Screen.LiveConversation]: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
    )
};


const Sidebar: React.FC<SidebarProps> = ({ currentScreen, navigate }) => {
  const navItems = [
    { screen: Screen.Dashboard, label: 'Painel' },
    { screen: Screen.Progress, label: 'Progresso' },
    { screen: Screen.Confidence, label: 'Confiança' },
  ];

  const aiTools = [
     { screen: Screen.LiveConversation, label: 'Conversa ao Vivo' },
     { screen: Screen.Tutor, label: 'Tutor IA' },
     { screen: Screen.Chatbot, label: 'Chatbot' },
     { screen: Screen.ImageAnalysis, label: 'Análise de Imagem' },
     { screen: Screen.VideoAnalysis, label: 'Análise de Vídeo' },
  ]

  return (
    <aside className="fixed top-0 left-0 h-full w-16 md:w-64 bg-brand-light text-text-primary flex flex-col transition-width duration-300 z-10 border-r border-brand-dark/50">
      <div className="flex items-center justify-center h-20 border-b border-brand-dark/50">
        <span className="text-2xl font-black font-display text-brand-primary md:hidden">F</span>
        <span className="hidden md:inline text-2xl font-black font-display text-brand-primary">Be Fluent AI</span>
      </div>
      <nav className="flex-1 mt-4 overflow-y-auto">
        <p className="hidden md:block px-5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Aprendizado</p>
        <ul>
          {navItems.map((item) => (
            <li key={item.screen} className="px-2">
              <button
                onClick={() => navigate(item.screen)}
                className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 text-brand-accent ${
                  currentScreen === item.screen
                    ? 'bg-brand-primary text-brand-secondary'
                    : 'text-text-primary hover:bg-brand-primary/20'
                }`}
              >
                {iconMap[item.screen]}
                <span className="hidden md:inline ml-4 font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
         <p className="hidden md:block mt-6 px-5 text-xs font-semibold text-text-secondary uppercase tracking-wider">Ferramentas IA</p>
         <ul>
          {aiTools.map((item) => (
            <li key={item.screen} className="px-2">
              <button
                onClick={() => navigate(item.screen)}
                className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 text-brand-accent ${
                  currentScreen === item.screen
                    ? 'bg-brand-primary text-brand-secondary'
                    : 'text-text-primary hover:bg-brand-primary/20'
                }`}
              >
                {iconMap[item.screen]}
                <span className="hidden md:inline ml-4 font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;