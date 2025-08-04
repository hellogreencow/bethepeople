import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
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
              className="h-8 sm:h-10 w-auto"
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
              className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:scale-105"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">AI Assistant</span>
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user && (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-white font-medium text-sm sm:text-base hidden sm:block">{user.name}</span>
              </div>
            )}
            
            {/* Mobile AI Assistant Button */}
            <button
              onClick={onOpenAIChat}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-white/20 bg-black/20 backdrop-blur-sm">
          <div className="flex justify-around py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                  }}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg scale-105'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium mt-1 text-center">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </nav>
  );
};

export default Navigation;