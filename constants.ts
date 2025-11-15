import { EnglishLevel, Lesson, PracticeSession, Conversation } from './types';

export const DUMMY_LESSONS: Lesson[] = [
  {
    id: 1,
    title: 'Pedindo Comida em um Restaurante',
    level: EnglishLevel.Beginner,
    type: 'Assimilação',
    content: `
Welcome to our lesson on ordering food! Let's learn some key phrases.
When you enter a restaurant, you might say: "A table for two, please."
To order, you can say: "I'd like the chicken pasta."
If you have a question, you can ask: "What do you recommend?"
    `,
    audioSlowUrl: '/audio/slow-lesson1.mp3',
    audioNormalUrl: '/audio/normal-lesson1.mp3',
    keyPhrases: [
      { phrase: "A table for two, please.", stress: "A **ta**ble for **two**, please." },
      { phrase: "I'd like the chicken pasta.", stress: "I'd **like** the **chick**en **pas**ta." },
      { phrase: "What do you recommend?", stress: "**What** do you recom**mend**?" },
    ],
  },
];

export const DUMMY_PRACTICE_SESSIONS: PracticeSession[] = [
    {
        id: 1,
        title: 'Pronúncia no Restaurante',
        type: 'Prática',
        sentences: [
            { id: 1, text: "Could I see the menu, please?", audioSlowUrl: "/audio/practice1-1-slow.mp3", audioNormalUrl: "/audio/practice1-1-normal.mp3" },
            { id: 2, text: "I'm allergic to peanuts.", audioSlowUrl: "/audio/practice1-2-slow.mp3", audioNormalUrl: "/audio/practice1-2-normal.mp3" },
            { id: 3, text: "Can we have the check, please?", audioSlowUrl: "/audio/practice1-3-slow.mp3", audioNormalUrl: "/audio/practice1-3-normal.mp3" },
        ],
        freestyleTopic: "Describe your favorite meal or a memorable experience you had at a restaurant."
    }
];

export const DUMMY_CONVERSATIONS: Conversation[] = [
    {
        id: 1,
        title: 'Reservando um Quarto de Hotel',
        type: 'Aplicação',
        scenario: 'Você está ligando para um hotel para reservar um quarto para uma viagem. Você precisa de um quarto de casal por três noites. Pergunte sobre o preço e se o café da manhã está incluído.',
        aiPersona: 'Você é um recepcionista de hotel amigável e prestativo.'
    }
];