import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { LogoIcon } from './Icons';

interface Message {
  role: 'user' | 'model';
  text: string;
}

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const ChatBot: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newChat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are a helpful and friendly AI assistant named SmartBot. Keep your responses concise and informative.',
      },
    });
    setChat(newChat);
    setMessages([{ role: 'model', text: 'Hello! How can I help you today?' }]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !chat || isLoading) return;

    const userMessage: Message = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseStream = await chat.sendMessageStream({ message: inputValue });
      
      let currentModelMessage = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        currentModelMessage += chunkText;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', text: currentModelMessage };
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-lg shadow-lg h-full flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-2xl font-bold text-on-surface">AI Chat Bot</h2>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && <LogoIcon className="w-8 h-8 text-primary flex-shrink-0 mt-1" />}
              <div className={`p-3 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-slate-700 text-on-surface'}`}>
                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length-1]?.role === 'user' && (
             <div className="flex items-start gap-3">
               <LogoIcon className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
               <div className="p-3 rounded-lg bg-slate-700 text-on-surface">
                 <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-secondary rounded-full animate-pulse delay-75"></span>
                    <span className="w-2 h-2 bg-secondary rounded-full animate-pulse delay-150"></span>
                    <span className="w-2 h-2 bg-secondary rounded-full animate-pulse delay-300"></span>
                 </div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-slate-700">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow bg-slate-700 border border-slate-600 rounded-lg shadow-sm py-2 px-4 focus:outline-none focus:ring-secondary focus:border-secondary text-on-surface"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-secondary hover:bg-emerald-500 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};