import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Screen, UserProfile } from './types';
import FooterNav from './components/FooterNav';
import WelcomeScreen from './components/screens/WelcomeScreen';
import ProfileSetup from './components/screens/ProfileSetup';
import Dashboard from './components/screens/Dashboard';
import LessonView from './components/screens/LessonView';
import PracticeView from './components/screens/PracticeView';
import ConversationView from './components/screens/ConversationView';
import ConfidenceView from './components/screens/ConfidenceView';
import ProgressView from './components/screens/ProgressView';
import ImageAnalysisScreen from './components/screens/ImageAnalysisScreen';
import VideoAnalysisScreen from './components/screens/VideoAnalysisScreen';
import TutorScreen from './components/screens/TutorScreen';
import ChatbotScreen from './components/screens/ChatbotScreen';
import LiveConversationScreen from './components/screens/LiveConversationScreen';
import { DUMMY_LESSONS, DUMMY_PRACTICE_SESSIONS, DUMMY_CONVERSATIONS } from './constants';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Welcome);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [selectedPracticeId, setSelectedPracticeId] = useState<number | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);

  // Register the service worker for PWA functionality
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('Service Worker registered: ', registration);
        }).catch(registrationError => {
          console.log('Service Worker registration failed: ', registrationError);
        });
      });
    }
  }, []);

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setCurrentScreen(Screen.Dashboard);
  };

  const navigate = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
  }, []);

  const viewLesson = (id: number) => {
    setSelectedLessonId(id);
    setCurrentScreen(Screen.Lesson);
  };
  
  const startPractice = (id: number) => {
    setSelectedPracticeId(id);
    setCurrentScreen(Screen.Practice);
  };

  const startConversation = (id: number) => {
    setSelectedConversationId(id);
    setCurrentScreen(Screen.Conversation);
  };

  const selectedLesson = useMemo(() => DUMMY_LESSONS.find(l => l.id === selectedLessonId), [selectedLessonId]);
  const selectedPractice = useMemo(() => DUMMY_PRACTICE_SESSIONS.find(p => p.id === selectedPracticeId), [selectedPracticeId]);
  const selectedConversation = useMemo(() => DUMMY_CONVERSATIONS.find(c => c.id === selectedConversationId), [selectedConversationId]);

  const renderContent = () => {
    switch (currentScreen) {
      case Screen.Welcome:
        return <WelcomeScreen onStart={() => setCurrentScreen(Screen.ProfileSetup)} />;
      case Screen.ProfileSetup:
        return <ProfileSetup onComplete={handleProfileComplete} />;
      case Screen.Dashboard:
        return <Dashboard 
          userProfile={userProfile} 
          onViewLesson={viewLesson} 
          onStartPractice={startPractice}
          onStartConversation={startConversation}
          navigate={navigate}
        />;
      case Screen.Lesson:
        return selectedLesson ? <LessonView lesson={selectedLesson} onComplete={() => navigate(Screen.Dashboard)} /> : <p>Lição não encontrada</p>;
      case Screen.Practice:
        return selectedPractice ? <PracticeView practiceSession={selectedPractice} onComplete={() => navigate(Screen.Dashboard)} /> : <p>Prática não encontrada</p>;
      case Screen.Conversation:
        return selectedConversation ? <ConversationView conversation={selectedConversation} onComplete={() => navigate(Screen.Dashboard)} /> : <p>Conversa não encontrada</p>;
      case Screen.Confidence:
        return <ConfidenceView />;
      case Screen.Progress:
        return <ProgressView />;
      case Screen.ImageAnalysis:
        return <ImageAnalysisScreen />;
      case Screen.VideoAnalysis:
        return <VideoAnalysisScreen />;
      case Screen.Tutor:
        return <TutorScreen />;
      case Screen.Chatbot:
        return <ChatbotScreen />;
      case Screen.LiveConversation:
        return <LiveConversationScreen />;
      default:
        return <Dashboard 
            userProfile={userProfile} 
            onViewLesson={viewLesson} 
            onStartPractice={startPractice}
            onStartConversation={startConversation}
            navigate={navigate}
        />;
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-brand-secondary flex items-center justify-center p-4">
        {currentScreen === Screen.Welcome && <WelcomeScreen onStart={() => setCurrentScreen(Screen.ProfileSetup)} />}
        {currentScreen === Screen.ProfileSetup && <ProfileSetup onComplete={handleProfileComplete} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-secondary">
      <main className="p-4 sm:p-6 lg:p-8 pb-20">
        {renderContent()}
      </main>
      <FooterNav currentScreen={currentScreen} navigate={navigate} />
    </div>
  );
};

export default App;