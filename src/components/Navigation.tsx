import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useMobile } from '../hooks/useMobile';
import { Home, User, MessageCircle } from 'lucide-react';

interface NavigationProps {
  onOpenAIChat: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onOpenAIChat }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const navItems = [
    { path: '/feed', icon: Home, label: 'Opportunities' },
    { path: '/dashboard', icon: User, label: 'Dashboard' },
  ];

  return (
    <nav className="bg-white/10 backdrop-blur-xl border-b border-white/20 relative z-[100] sticky top-0">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/feed')}
          >
            <img 
              src="/bethepeople.png" 
              alt="Be The People" 
              className="h-10 w-auto"
            />
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                  }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors relative z-10 pointer-events-auto ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
            
            {/* AI Assistant Button */}
            <button
              onClick={onOpenAIChat}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transform hover:scale-105"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">AI Assistant</span>
            </button>
          </div>

          {/* User Info & Mobile AI Chat */}
          <div className="flex items-center space-x-4">
            {/* Mobile AI Chat Button */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-white font-medium">{user.name}</span>
              </div>
            )}
            
            {/* Mobile AI Chat Button */}
            <button
              onClick={onOpenAIChat}
              className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Chat</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
      </div>

    </nav>
  );
};

export default Navigation;