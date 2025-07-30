import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Home, User, MessageCircle } from 'lucide-react';
import AIChat from './AIChat';

const BeThePeopleLogo: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 80 80"
    className={`${className} drop-shadow-lg`}
  >
    {/* Background circle */}
    <circle
      cx="40"
      cy="40"
      r="38"
      fill="url(#logoGradient)"
      stroke="#4B0082"
      strokeWidth="2"
    />
    
    {/* People figures */}
    <g fill="white">
      {/* Person 1 */}
      <circle cx="25" cy="25" r="4" />
      <rect x="22" y="30" width="6" height="12" rx="3" />
      
      {/* Person 2 */}
      <circle cx="40" cy="20" r="4" />
      <rect x="37" y="25" width="6" height="12" rx="3" />
      
      {/* Person 3 */}
      <circle cx="55" cy="25" r="4" />
      <rect x="52" y="30" width="6" height="12" rx="3" />
    </g>
    
    {/* Heart in center */}
    <path
      d="M40 50 C35 45, 25 45, 25 35 C25 30, 30 25, 35 30 C37 32, 40 35, 40 35 C40 35, 43 32, 45 30 C50 25, 55 30, 55 35 C55 45, 45 45, 40 50 Z"
      fill="#FF0040"
      stroke="white"
      strokeWidth="1"
    />
    
    {/* Connecting lines */}
    <g stroke="white" strokeWidth="2" opacity="0.7">
      <line x1="28" y1="35" x2="37" y2="40" />
      <line x1="43" y1="40" x2="52" y2="35" />
    </g>
    
    {/* Gradient definition */}
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6A1B9A" />
        <stop offset="50%" stopColor="#4B0082" />
        <stop offset="100%" stopColor="#FF4070" />
      </linearGradient>
    </defs>
  </svg>
);

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const [isAIChatOpen, setIsAIChatOpen] = React.useState(false);

  const navItems = [
    { path: '/feed', icon: Home, label: 'Opportunities' },
    { path: '/dashboard', icon: User, label: 'Dashboard' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/feed')}
          >
            <BeThePeopleLogo className="h-8 w-8 mr-3" />
            <span className="text-xl font-bold text-gray-900">Be The People</span>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-electric-blue bg-blue-50 font-bold'
                      : 'text-gray-700 hover:text-electric-blue hover:bg-blue-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
            
            {/* AI Assistant Button */}
            <button
              onClick={() => setIsAIChatOpen(true)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors bg-gradient-to-r from-electric-blue to-electric-red text-white hover:shadow-lg transform hover:scale-105"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">AI Assistant</span>
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden md:flex items-center space-x-3">
                <div className="bg-electric-red rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">{user.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="flex justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                    isActive
                      ? 'text-electric-blue bg-blue-50 font-bold'
                      : 'text-gray-700 hover:text-electric-blue'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium mt-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Chat Popup */}
      <AIChat 
        isOpen={isAIChatOpen} 
        onClose={() => setIsAIChatOpen(false)} 
      />
    </nav>
  );
};

export default Navigation;