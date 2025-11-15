import { GoogleGenAI, Type, Modality, GenerateContentResponse, Chat, LiveSession } from "@google/genai";
import { PronunciationFeedback, ChatMessage, ShadowingFeedback, StressFeedback, FreestyleFeedback } from "../types";
import { blobToBase64, fetchAudioAsBase64 } from "../utils/audioUtils";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY not found. Please set it in your environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function getPronunciationFeedback(targetSentence: string, userTranscription: string): Promise<PronunciationFeedback> {
  if (!API_KEY) {
    // Return mock data if API key is not available
    console.log("Using mock feedback data.");
    const isMatch = targetSentence.toLowerCase().replace(/[.,?]/g, '') === userTranscription.toLowerCase().replace(/[.,?]/g, '');
    return {
      score: isMatch ? 95 : 60,
      mistakes: isMatch ? [] : [{ target: 'see', transcribed: 'sea', feedback: 'Ótima tentativa! Os sons das vogais são parecidos, mas pratique o som /iy/ em "see".' }],
      stressWords: targetSentence.split(' ').filter(word => word.length > 5), // Simple mock logic
      intonationType: targetSentence.endsWith('?') ? 'rising-question' : 'statement'
    };
  }
  
  const model = "gemini-2.5-flash";
  const prompt = `You are an expert English pronunciation coach for native Brazilian Portuguese speakers. A student is practicing the sentence: '${targetSentence}'. The speech-to-text recognized their attempt as: '${userTranscription}'.
Based on the differences, and keeping in mind common pronunciation challenges for Portuguese speakers, provide feedback.
1.  **Accuracy Score:** Give a score from 0-100 on how closely the transcription matches the target sentence.
2.  **Mistakes:** Pinpoint the exact words that were likely mispronounced. If the transcription is perfect, return an empty array.
3.  **Feedback:** Provide friendly, actionable advice in simple English.
4.  **Stress Pattern:** Analyze the target sentence and identify the stressed words.
5.  **Intonation Type:** Classify the sentence as a 'statement', 'rising-question', or 'falling-question'.

Return your response as a valid JSON object.
`;

  try {
     const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER },
                    mistakes: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                target: { type: Type.STRING },
                                transcribed: { type: Type.STRING },
                                feedback: { type: Type.STRING }
                            }
                        }
                    },
                    stressWords: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    intonationType: {
                        type: Type.STRING,
                        enum: ['statement', 'rising-question', 'falling-question']
                    }
                }
            }
        }
     });

    const jsonString = response.text;
    const feedback = JSON.parse(jsonString);
    return feedback as PronunciationFeedback;

  } catch (error) {
    console.error("Error getting pronunciation feedback from Gemini:", error);
    throw new Error("Failed to get feedback from AI.");
  }
}

export async function getShadowingFeedback(nativeAudioUrl: string, userAudioBlob: Blob, targetSentence: string): Promise<ShadowingFeedback> {
    if (!API_KEY) {
         return {
            similarityScore: 88,
            feedbackPoints: [
                "Great job matching the rising intonation at the end!",
                "Your pace was slightly faster than the native speaker's. Try to slow down just a bit.",
            ],
            stressWords: targetSentence.split(' ').filter(word => word.length > 5),
            intonationType: targetSentence.endsWith('?') ? 'rising-question' : 'statement'
        };
    }
    
    const model = "gemini-2.5-flash";
    const nativeAudioBase64 = await fetchAudioAsBase64(nativeAudioUrl);
    const userAudioBase64 = await blobToBase64(userAudioBlob);

    const nativeAudioPart = { inlineData: { data: nativeAudioBase64, mimeType: 'audio/mp3' } }; // Assuming mp3, adjust if needed
    const userAudioPart = { inlineData: { data: userAudioBase64, mimeType: userAudioBlob.type } };

    const prompt = `You are an expert English pronunciation coach. A student is practicing shadowing the sentence: "${targetSentence}".
I am providing two audio files: the first is the native speaker, the second is the student's attempt.
Analyze the student's audio in comparison to the native speaker's. Focus on:
1.  **Rhythm and Pacing:** Is the student's timing similar?
2.  **Intonation and Melody:** Does the student's pitch contour match the original?
3.  **Vowel and Consonant Sounds:** Are there any noticeable pronunciation differences?

Provide a similarity score from 0-100 and a few actionable feedback points in simple English. Also, identify the stressed words and intonation type from the target sentence.
Return your response as a valid JSON object.
`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [
                { text: prompt },
                nativeAudioPart,
                userAudioPart
            ]},
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        similarityScore: { type: Type.NUMBER },
                        feedbackPoints: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                         stressWords: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        intonationType: {
                            type: Type.STRING,
                            enum: ['statement', 'rising-question', 'falling-question']
                        }
                    }
                }
            }
        });

        const jsonString = response.text;
        return JSON.parse(jsonString) as ShadowingFeedback;

    } catch (error) {
        console.error("Error getting shadowing feedback:", error);
        throw new Error("Failed to get shadowing feedback.");
    }
}

export async function getStressFeedback(targetSentence: string, userAudioBlob: Blob): Promise<StressFeedback> {
    if (!API_KEY) {
        return {
            annotatedSentence: `Could I **see** the *menu*, please?`,
            feedbackPoints: [
                "Great stress on 'see'!",
                "You put a little too much stress on 'menu'. It's a content word but not the main focus here.",
                "Try to make 'please' a bit more stressed to be more polite."
            ],
            stressWords: ["Could", "see", "menu", "please"],
            intonationType: 'rising-question',
        };
    }

    const model = "gemini-2.5-flash";
    const userAudioBase64 = await blobToBase64(userAudioBlob);
    const userAudioPart = { inlineData: { data: userAudioBase64, mimeType: userAudioBlob.type } };

    const prompt = `You are an expert English pronunciation coach specializing in sentence stress for native Brazilian Portuguese speakers.
A student recorded themselves saying: "${targetSentence}".
Analyze their audio to evaluate their use of sentence stress.
1.  **Annotated Sentence**: Return the original sentence. Wrap correctly stressed words in \`**\`. Wrap incorrectly stressed words (e.g., missed stress on an important word, or stress on an unimportant word) in \`*\`.
2.  **Feedback Points**: Provide a short list of 2-3 friendly, actionable tips in simple English about their stress pattern.
3.  **Stress Words**: Identify the key words that SHOULD be stressed in the original sentence.
4.  **Intonation Type**: Classify the sentence as 'statement', 'rising-question', or 'falling-question'.

Return your response as a valid JSON object.
`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [{ text: prompt }, userAudioPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        annotatedSentence: { type: Type.STRING },
                        feedbackPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                        stressWords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        intonationType: {
                            type: Type.STRING,
                            enum: ['statement', 'rising-question', 'falling-question']
                        }
                    }
                }
            }
        });
        const jsonString = response.text;
        return JSON.parse(jsonString) as StressFeedback;
    } catch (error) {
        console.error("Error getting stress feedback:", error);
        throw new Error("Failed to get stress feedback.");
    }
}


export async function getConversationResponse(history: ChatMessage[], aiPersona: string, userMessage: string): Promise<string> {
    if (!API_KEY) {
        return "Desculpe, minhas funções de IA estão desativadas no momento. Como posso ajudar com a reserva do hotel?";
    }
    
    const model = "gemini-flash-lite-latest";
    
    const promptHistory = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
        model,
        config: {
          systemInstruction: aiPersona,
        },
        history: promptHistory,
    });
    
    try {
        const response = await chat.sendMessage({ message: userMessage });
        return response.text;
    } catch (error) {
        console.error("Error getting conversation response from Gemini:", error);
        throw new Error("Failed to get response from AI.");
    }
}

export async function analyzeImage(imageData: string, mimeType: string, prompt: string): Promise<string> {
    if (!API_KEY) return "Análise de imagem indisponível sem chave de API.";
    
    const model = 'gemini-2.5-flash';
    const imagePart = { inlineData: { data: imageData, mimeType } };
    const textPart = { text: prompt };

    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [textPart, imagePart] }
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing image:", error);
        throw new Error("Falha ao analisar a imagem.");
    }
}

export async function analyzeVideo(videoData: string, mimeType: string, prompt: string): Promise<string> {
    if (!API_KEY) return "Análise de vídeo indisponível sem chave de API.";
    
    // Note: This is a simplified approach. For large videos, the API recommends file upload.
    // Here we use inline data for smaller files, suitable for web clients.
    const model = 'gemini-2.5-pro';
    const videoPart = { inlineData: { data: videoData, mimeType } };
    const textPart = { text: prompt };

    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [textPart, videoPart] }
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing video:", error);
        throw new Error("Falha ao analisar o vídeo.");
    }
}

export async function getTutorResponse(history: ChatMessage[], userMessage: string): Promise<string> {
    if (!API_KEY) return "Tutor IA indisponível.";

    const model = 'gemini-2.5-pro';
    const promptHistory = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
    
    const chat = ai.chats.create({
        model,
        config: {
          systemInstruction: 'You are an expert English language tutor. Your student is a native Brazilian Portuguese speaker. Explain complex topics clearly and concisely.',
          thinkingConfig: { thinkingBudget: 32768 }
        },
        history: promptHistory,
    });

    try {
        const response = await chat.sendMessage({ message: userMessage });
        return response.text;
    } catch (error) {
        console.error("Error getting tutor response:", error);
        throw new Error("Falha ao obter resposta do tutor.");
    }
}

export async function generateSpeech(text: string): Promise<string> {
    if (!API_KEY) throw new Error("TTS indisponível.");

    const model = 'gemini-2.5-flash-preview-tts';
    try {
        const response = await ai.models.generateContent({
            model,
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }
                    }
                }
            }
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("Nenhum dado de áudio retornado.");
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Falha ao gerar áudio.");
    }
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!API_KEY) return "Transcrição indisponível.";
    
    const model = 'gemini-2.5-flash';
    const audioData = await blobToBase64(audioBlob);

    try {
        const response = await ai.models.generateContent({
            model,
            contents: {
                parts: [
                    { text: "Transcribe this audio. The speaker is practicing English." },
                    { inlineData: { data: audioData, mimeType: audioBlob.type } }
                ]
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error transcribing audio:", error);
        throw new Error("Falha na transcrição do áudio.");
    }
}

export async function getChatbotResponse(history: ChatMessage[], userMessage: string): Promise<GenerateContentResponse> {
    if (!API_KEY) {
        const mockResponse = { text: "Chatbot indisponível." } as GenerateContentResponse;
        return Promise.resolve(mockResponse);
    }

    const model = 'gemini-2.5-flash';
    const promptHistory = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
    
    const chat: Chat = ai.chats.create({
        model,
        config: {
          systemInstruction: 'You are a helpful chatbot for an English learning app. Answer questions concisely. Your user is a native Brazilian Portuguese speaker.',
          tools: [{googleSearch: {}}]
        },
        history: promptHistory
    });

    try {
        const response = await chat.sendMessage({ message: userMessage });
        return response;
    } catch (error) {
        console.error("Error getting chatbot response:", error);
        throw new Error("Falha ao obter resposta do chatbot.");
    }
}

export async function getFreestyleFeedback(audioBlob: Blob, topic: string): Promise<FreestyleFeedback> {
    if (!API_KEY) {
        // Mock data
        return {
            transcription: "I really like Italian food. My favorite dish is lasagna. I went to a great restaurant last week and the lasagna was amazing.",
            vocabularyFeedback: [
                "Good use of 'amazing' and 'memorable'.",
                "To add more detail, you could use words like 'delicious', 'savory', or 'creamy'."
            ],
            grammarFeedback: [
                "Your grammar is mostly correct!",
                "Minor point: 'went to a great restaurant' is perfect."
            ],
            overallFeedback: "This is a clear and well-structured response. You communicated your idea effectively. Keep practicing describing experiences to build fluency!"
        };
    }

    const model = "gemini-2.5-flash";
    
    // First, transcribe the audio
    const transcription = await transcribeAudio(audioBlob);

    const prompt = `You are an expert English language coach for native Brazilian Portuguese speakers. A student was asked to speak freely about the following topic: "${topic}".
They produced the following text:
"${transcription}"

Please analyze their response and provide feedback.
1.  **Vocabulary Feedback**: Comment on their word choice. Are the words appropriate? Suggest 1-2 alternative or more descriptive words they could use.
2.  **Grammar Feedback**: Check for grammatical errors. Provide simple corrections if any are found. If grammar is good, praise them.
3.  **Overall Feedback**: Give a brief, encouraging summary of their performance, focusing on fluency and clarity.

Return your response as a valid JSON object. Keep feedback points in short, easily digestible strings.
`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        vocabularyFeedback: { type: Type.ARRAY, items: { type: Type.STRING } },
                        grammarFeedback: { type: Type.ARRAY, items: { type: Type.STRING } },
                        overallFeedback: { type: Type.STRING }
                    },
                    required: ["vocabularyFeedback", "grammarFeedback", "overallFeedback"]
                }
            }
        });
        const jsonString = response.text;
        const feedbackData = JSON.parse(jsonString);
        return { ...feedbackData, transcription }; // Add the transcription to the final object
    } catch (error) {
        console.error("Error getting freestyle feedback:", error);
        throw new Error("Failed to get freestyle feedback.");
    }
}

export function connectToLiveSession(callbacks: {
    onopen: () => void;
    onmessage: (message: any) => void;
    onerror: (e: any) => void;
    onclose: (e: any) => void;
}): Promise<LiveSession> {
    if (!API_KEY) {
        throw new Error("Live conversation requires an API key.");
    }
    const aiWithKey = new GoogleGenAI({ apiKey: API_KEY });
    return aiWithKey.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: 'You are a friendly and helpful English conversation partner. Keep your responses short and encouraging for a Brazilian Portuguese speaker who is learning English.',
        },
    });
}