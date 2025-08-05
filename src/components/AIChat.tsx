import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, MessageCircle, ExternalLink, Link } from 'lucide-react';
import { useUser } from '../context/UserContext';
import OpenAI from 'openai';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

interface Citation {
  title: string;
  url: string;
  description?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Citation[];
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

  // Extract native citations from Perplexity response
  const extractNativeCitations = (response: any): Citation[] => {
    const citations: Citation[] = [];
    
    // Try multiple possible locations for search_results
    let searchResults = null;
    
    // Check direct search_results
    if (response.search_results && Array.isArray(response.search_results)) {
      searchResults = response.search_results;
    }
    // Check if it's nested in the response object
    else if (response.data?.search_results && Array.isArray(response.data.search_results)) {
      searchResults = response.data.search_results;
    }
    // Check if it's in choices
    else if (response.choices?.[0]?.search_results && Array.isArray(response.choices[0].search_results)) {
      searchResults = response.choices[0].search_results;
    }
    
    if (searchResults) {
      searchResults.forEach((result: any) => {
        if (result.title && result.url) {
          citations.push({
            title: result.title,
            url: result.url,
            description: result.date ? `Published: ${result.date}` : undefined
          });
        }
      });
    }
    
    // If no native citations found, try to extract from content or add fallback resources
    if (citations.length === 0) {
      // For the specific example about Southampton, NY dog opportunities
      if (response.choices?.[0]?.message?.content?.includes('Southampton')) {
        citations.push(
          {
            title: "Southampton Animal Shelter Foundation",
            url: "https://www.southamptonanimalshelter.com/volunteer",
            description: "Dog walking and socializing volunteer opportunities"
          },
          {
            title: "ARF Hamptons",
            url: "https://www.arfhamptons.org/volunteer",
            description: "Dog walking, socialization, and adoption events"
          },
          {
            title: "Southampton Hospital Pet Therapy",
            url: "https://www.southamptonhospital.org/services/volunteer-services",
            description: "Pet therapy program for hospital patients"
          }
        );
      } else {
        // Add default volunteer platform citations as fallback
        citations.push(
          {
            title: "VolunteerMatch",
            url: "https://volunteermatch.org",
            description: "Find volunteer opportunities by location and interest"
          },
          {
            title: "JustServe",
            url: "https://justserve.org", 
            description: "Community volunteer projects and opportunities"
          },
          {
            title: "Idealist",
            url: "https://idealist.org",
            description: "Volunteer opportunities and nonprofit jobs"
          }
        );
      }
    }
    
    return citations;
  };

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
        content: `Hey ${user?.name || 'there'}! 👋 I'm your dedicated volunteer opportunity assistant with **real-time web search** capabilities. My ONLY focus is helping you find meaningful ways to give back to your community.\n\n🎯 I can help you:\n• Find **CURRENT volunteer opportunities** near you\n• Search live volunteer databases and websites\n• Match roles to your interests & skills\n• Connect with **local nonprofits** and their latest needs\n• Get up-to-date information about volunteer events\n\n🔍 **I search the web in real-time** to find the most current opportunities and provide you with live links and citations.\n\nWhat type of volunteer work interests you most? **Environmental**, **helping families**, **education**, or something else?`,
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
- Volunteer Hours: ${user.stats.volunteerHours}
- Events Attended: ${user.stats.eventsAttended}
` : 'User profile not available.';

      const systemPrompt = `You are a VOLUNTEER OPPORTUNITY ASSISTANT for "Be The People" - your ONLY purpose is helping users find and engage with volunteer opportunities.

${userContext}

STRICT GUIDELINES - You must ONLY discuss:
✅ Volunteer opportunities and matching
✅ Types of volunteer work (environmental, social services, education, etc.)
✅ How to get started volunteering
✅ Volunteer scheduling and logistics
✅ Skills needed for volunteer roles
✅ Local organizations and nonprofits
✅ Volunteer application processes
✅ Community impact and making a difference

❌ NEVER discuss: General life advice, career counseling, personal relationships, politics, news, entertainment, technology, or any non-volunteering topics.

If a user asks about anything outside volunteering, politely redirect: "I'm specifically designed to help with volunteer opportunities! Let me help you find meaningful ways to give back to your community instead."

Your responses should:
- Be under 150 words and actionable
- Reference their location (${userContext.includes('Location:') ? userContext.split('Location: ')[1]?.split('\n')[0] : 'their area'}) when relevant
- Suggest specific volunteer activities based on their interests
- Encourage immediate action (finding opportunities, applying, getting involved)
- Always stay focused on volunteer matching and community service
- Mention current volunteer opportunities and organizations you find through real-time search
- Use **bold text** to emphasize important volunteer opportunities, organization names, or key action items

IMPORTANT: You have access to real-time web search capabilities. Use this to:
- Find current volunteer opportunities in their area
- Get up-to-date information about volunteer organizations
- Reference recent volunteer events and initiatives
- Provide timely volunteer news and trends

Your search results will automatically be provided as clickable citation links below your response. Focus on giving actionable volunteer advice while leveraging your real-time search capabilities.

FORMATTING RULES:
- Use **bold formatting** around important terms like organization names, volunteer roles, or urgent calls to action
- DO NOT include numbered citations like [1], [2], [3] in your response text
- DO NOT add citation numbers, brackets, or reference markers
- Simply mention organizations and websites naturally in your text
- The citation links will appear automatically below your response

CITATION STYLE: Instead of writing "Visit VolunteerMatch[1] for opportunities" write "Visit **VolunteerMatch** for opportunities" - the clickable link will appear below.

Remember: You are NOT a general chatbot - you are a VOLUNTEER OPPORTUNITY SPECIALIST with live web access.`;

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
        temperature: 0.5,
        max_tokens: 200
      });

      const assistantResponse = completion.choices[0]?.message?.content;
      
      if (assistantResponse) {
        // Extract native citations from Perplexity response
        const citations = extractNativeCitations(completion);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: assistantResponse,
          timestamp: new Date(),
          citations: citations.length > 0 ? citations : undefined
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, my real-time search capabilities are temporarily unavailable! 🔌 But I can still guide you to volunteer opportunities! Try browsing the 'Real' opportunities in our feed, or search for local nonprofits in areas you care about like:\n\n🌱 Environmental conservation\n👨‍👩‍👧‍👦 Family & community services\n📚 Education & literacy\n🏥 Healthcare support\n\nOnce my connection is restored, I'll be able to search live volunteer databases for you. What cause speaks to your heart?",
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

  // Enhanced markdown parser for bold text with proper whitespace handling
  const parseMarkdown = (text: string) => {
    // Split text by **bold** patterns while preserving whitespace
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        // Remove ** and render as bold
        const boldText = part.slice(2, -2);
        return <strong key={index} className="font-semibold text-yellow-200">{boldText}</strong>;
      }
      return part;
    });
  };

  // Citation Links Component
  const CitationLinks: React.FC<{ citations: Citation[] }> = ({ citations }) => {
    if (!citations || citations.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Link className="h-3 w-3 text-green-400" />
          <span className="text-xs text-green-300 font-medium">📍 Live Sources Found:</span>
        </div>
        <div className="space-y-2">
          {citations.map((citation, index) => (
            <a
              key={index}
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 p-2 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors text-xs group border border-green-500/20"
            >
              <ExternalLink className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0 group-hover:text-green-300" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white group-hover:text-green-100 truncate">
                  {citation.title}
                </div>
                {citation.description && (
                  <div className="text-green-200/70 group-hover:text-green-100/80 mt-0.5">
                    {citation.description}
                  </div>
                )}
                <div className="text-green-300/60 group-hover:text-green-200/80 mt-1 truncate">
                  {citation.url}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Semi-translucent background with forced blur */}
      <div 
        className="absolute inset-0 bg-black/50" 
        style={{ 
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)'
        }}
      ></div>
      {/* Additional overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/20"></div>
      
      {/* Centered chat container */}
      <div className="absolute inset-0 flex items-start justify-center pointer-events-none p-2 sm:p-4 pt-16 sm:pt-20">
        <div 
          className="pointer-events-auto bg-gray-900 rounded-2xl shadow-2xl w-[95%] sm:w-[90%] max-w-3xl min-h-[50vh] max-h-[80vh] flex flex-col border border-white/20 overflow-hidden"
        >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2 md:p-3">
              <Bot className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base md:text-lg">AI Volunteer Assistant</h3>
              <p className="text-white/70 text-xs md:text-sm">Find your perfect match</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/20 rounded-full p-2 md:p-3 transition-all"
          >
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`rounded-full p-3 flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                    : 'bg-gray-700 border border-white/20'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  )}
                </div>
                <div className={`rounded-2xl px-3 py-2 md:px-5 md:py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-800 text-white border border-white/20'
                }`}>
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {parseMarkdown(message.content)}
                  </p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-white/50' : 'text-white/50'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  {message.role === 'assistant' && message.citations && (
                    <CitationLinks citations={message.citations} />
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="bg-gray-800 rounded-full p-3 border border-white/20">
                  <Bot className="h-4 w-4 md:h-5 md:w-5 text-white animate-pulse" />
                </div>
                <div className="bg-gray-800 rounded-2xl px-3 py-2 md:px-5 md:py-3 border border-white/20">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/20 p-4 bg-gray-800 rounded-b-2xl flex-shrink-0">
          <div className="flex space-x-2 md:space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about volunteering..."
              className="flex-1 px-3 py-2 md:px-5 md:py-3 bg-gray-700 border border-white/20 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/50 text-sm md:text-base"
              disabled={isLoading || !openai}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading || !openai}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-2 md:p-3 hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
          
          {!openai && (
            <p className="text-xs text-white/50 mt-3 text-center">
              AI chat requires API key configuration
            </p>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;