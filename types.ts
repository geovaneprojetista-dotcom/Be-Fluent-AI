export enum Screen {
  Welcome = 'WELCOME',
  ProfileSetup = 'PROFILE_SETUP',
  Dashboard = 'DASHBOARD',
  Lesson = 'LESSON',
  Practice = 'PRACTICE',
  Conversation = 'CONVERSATION',
  Confidence = 'CONFIDENCE',
  Progress = 'PROGRESS',
  ImageAnalysis = 'IMAGE_ANALYSIS',
  VideoAnalysis = 'VIDEO_ANALYSIS',
  Tutor = 'TUTOR',
  Chatbot = 'CHATBOT',
  LiveConversation = 'LIVE_CONVERSATION',
}

export enum EnglishLevel {
  Beginner = 'A1-A2',
  Intermediate = 'B1-B2',
  Advanced = 'C1-C2',
}

export interface UserProfile {
  name: string;
  level: EnglishLevel;
  goals: string[];
  fears: string;
}

export interface Lesson {
  id: number;
  title: string;
  level: EnglishLevel;
  type: 'Assimilação';
  content: string; // Markdown content
  audioSlowUrl: string;
  audioNormalUrl: string;
  keyPhrases: { phrase: string; stress: string }[];
}

export interface PronunciationFeedback {
  score: number;
  mistakes: { target: string; transcribed: string; feedback: string }[];
  stressWords: string[];
  intonationType: 'statement' | 'rising-question' | 'falling-question';
}

export interface ShadowingFeedback {
  similarityScore: number;
  feedbackPoints: string[];
  stressWords: string[];
  intonationType: 'statement' | 'rising-question' | 'falling-question';
}

export interface StressFeedback {
  annotatedSentence: string;
  feedbackPoints: string[];
  stressWords: string[];
  intonationType: 'statement' | 'rising-question' | 'falling-question';
}

export interface FreestyleFeedback {
  transcription: string;
  vocabularyFeedback: string[];
  grammarFeedback: string[];
  overallFeedback: string;
}

export type Feedback = PronunciationFeedback | ShadowingFeedback | StressFeedback | FreestyleFeedback;


export interface PracticeSession {
  id: number;
  title: string;
  type: 'Prática';
  sentences: { id: number; text: string; audioSlowUrl: string, audioNormalUrl: string }[];
  freestyleTopic: string;
}

export interface Conversation {
  id: number;
  title: string;
  type: 'Aplicação';
  scenario: string;
  aiPersona: string;
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
    sources?: { title: string; uri: string }[];
}