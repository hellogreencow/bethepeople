import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, MessageCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import OpenAI from 'openai';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize OpenRouter client
  const openai = OPENROUTER_API_KEY ? new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: OPENROUTER_API_KEY,
    dangerouslyAllowBrowser: true
  }) : null;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Hey ${user?.name || 'there'}! 👋 I'm your volunteer matching assistant. I'll help you find the perfect opportunity based on your interests, schedule, and location.\n\nTell me what kind of impact you want to make, or ask me anything about volunteering!`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user?.name, messages.length]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !openai) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Create context about the user
      const userContext = user ? `
User Profile:
- Name: ${user.name}
- Location: ${user.preferences.location}
- Interests: ${user.preferences.interests.join(', ')}
- Availability: ${user.preferences.availability}
- Contribution Types: ${user.preferences.contributionType.join(', ')}
- Volunteer Hours: ${user.volunteerHours}
- Events Attended: ${user.eventsAttended}
` : 'User profile not available.';

      const systemPrompt = `You are a helpful volunteer matching assistant for "Be The People" - a volunteer opportunity platform. 

${userContext}

Your job is to:
1. Help users find volunteer opportunities that match their interests and availability
2. Provide specific, actionable advice about volunteering
3. Suggest types of organizations to look for
4. Give tips on how to get started with volunteering
5. Be encouraging and supportive

Keep responses conversational, helpful, and under 200 words. Focus on practical advice and specific suggestions based on their profile.`;

      const completion = await openai.chat.completions.create({
        model: "perplexity/sonar",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-5).map(msg => ({ // Include last 5 messages for context
            role: msg.role,
            content: msg.content
          })),
          { role: "user", content: userMessage.content }
        ],
        temperature: 0.7,
        max_tokens: 300
      });

      const assistantResponse = completion.choices[0]?.message?.content;
      
      if (assistantResponse) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: assistantResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. But I can still help! Based on your interests, I'd suggest looking for local nonprofits, community centers, or checking out the opportunities in our feed. What specific cause are you most passionate about?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-electric-blue to-electric-red rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-full p-2">
              <Bot className="h-5 w-5 text-electric-blue" />
            </div>
            <div>
              <h3 className="font-bold text-white">AI Volunteer Assistant</h3>
              <p className="text-white text-sm opacity-90">Find your perfect match</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`rounded-full p-2 flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-electric-blue' 
                    : 'bg-gray-100'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-electric-blue" />
                  )}
                </div>
                <div className={`rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-electric-blue text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className={`text-xs mt-1 opacity-70 ${
                    message.role === 'user' ? 'text-white' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="bg-gray-100 rounded-full p-2">
                  <Bot className="h-4 w-4 text-electric-blue" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about volunteering..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-electric-blue focus:border-transparent"
              disabled={isLoading || !openai}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading || !openai}
              className="bg-electric-blue text-white rounded-full p-2 hover:bg-electric-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          
          {!openai && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              AI chat requires API key configuration
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIChat;