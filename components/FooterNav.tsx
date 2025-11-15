import React from 'react';
import { Screen } from '../types';

type FooterNavProps = {
  currentScreen: Screen;
  navigate: (screen: Screen) => void;
};

const HomeIcon = ({ isActive }: { isActive: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive ? 'text-brand-primary' : 'text-text-secondary'}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);

const MicIcon = ({ isActive }: { isActive: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive ? 'text-brand-primary' : 'text-text-secondary'}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
);

const ProfileIcon = ({ isActive }: { isActive: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive ? 'text-brand-primary' : 'text-text-secondary'}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);


const FooterNav: React.FC<FooterNavProps> = ({ currentScreen, navigate }) => {
    const navItems = [
        { screen: Screen.Dashboard, label: 'Home', icon: HomeIcon },
        { screen: Screen.LiveConversation, label: 'Praticar', icon: MicIcon },
        { screen: Screen.Progress, label: 'Perfil', icon: ProfileIcon },
    ];
    
    // The main screens for each tab. Other screens will not highlight a tab.
    const mainScreens = navItems.map(item => item.screen);

    return (
        <footer className="fixed bottom-0 left-0 right-0 h-16 bg-brand-light border-t border-brand-dark/50 flex justify-around items-center z-10">
            {navItems.map(item => {
                const isActive = currentScreen === item.screen;
                return (
                    <button
                        key={item.screen}
                        onClick={() => navigate(item.screen)}
                        className="flex flex-col items-center justify-center text-xs w-1/3 h-full transition-colors"
                    >
                        <item.icon isActive={isActive} />
                        <span className={isActive ? 'text-brand-primary' : 'text-text-secondary'}>{item.label}</span>
                    </button>
                )
            })}
        </footer>
    );
};

export default FooterNav;
