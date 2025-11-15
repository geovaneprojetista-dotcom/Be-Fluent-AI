import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { getChatbotResponse } from '../../services/geminiService';

const ChatbotScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);
    const textToSend = userInput;
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await getChatbotResponse(newMessages, textToSend);
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = groundingChunks?.map(chunk => ({
          uri: chunk.web?.uri || '',
          title: chunk.web?.title || 'Fonte desconhecida'
      })).filter(source => source.uri);

      setMessages([...newMessages, { sender: 'ai', text: response.text, sources }]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { sender: 'ai', text: "Desculpe, encontrei um erro. Você poderia repetir?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto flex flex-col h-[85vh]">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Chatbot com Busca Google</h1>
      <p className="text-text-secondary mb-4 pb-4 border-b border-brand-dark">
        Faça perguntas sobre fatos, notícias ou tópicos atuais. A IA usará a busca para encontrar as informações mais recentes.
      </p>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-4">
        {messages.length === 0 && (
            <div className="text-center text-text-secondary mt-8">
                <p>Ex: "Who won the last soccer world cup?"</p>
            </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-sm px-4 py-2 rounded-2xl whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-brand-primary text-brand-secondary rounded-br-none' : 'bg-brand-dark text-text-primary rounded-bl-none'}`}>
              {msg.text}
            </div>
            {msg.sources && msg.sources.length > 0 && (
                <div className="max-w-sm mt-2 text-xs">
                    <p className="font-semibold text-text-secondary">Fontes:</p>
                    <ul className="list-disc list-inside">
                        {msg.sources.map((source, idx) => (
                            <li key={idx} className="truncate">
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline">
                                    {source.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="max-w-sm px-4 py-2 rounded-2xl bg-brand-dark text-text-primary rounded-bl-none">
                     <Spinner/>
                 </div>
            </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-brand-dark flex items-center gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Faça sua pergunta..."
          className="flex-1 px-4 py-2 border border-brand-dark rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary bg-brand-light text-text-primary"
          disabled={isLoading}
        />
        <Button onClick={handleSendMessage} disabled={isLoading || !userInput} className="rounded-full">Enviar</Button>
      </div>
    </Card>
  );
};

export default ChatbotScreen;