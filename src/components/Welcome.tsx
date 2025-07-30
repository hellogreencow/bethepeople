import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Users, Globe, ArrowRight } from 'lucide-react';

const BeThePeopleLogo: React.FC = () => (
  <div className="relative">
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      className="drop-shadow-lg"
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
  </div>
);

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { setDemoUser } = useUser();

  const handleDemoLogin = () => {
    setDemoUser();
    navigate('/feed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-electric-blue via-white to-electric-red">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="mr-4">
                <BeThePeopleLogo />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Be The People
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              Connect with local volunteering opportunities based on what you care about most
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-electric-red rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="white">
                  <path d="M16 26 C12 22, 6 22, 6 16 C6 13, 9 10, 12 13 C14 15, 16 18, 16 18 C16 18, 18 15, 20 13 C23 10, 26 13, 26 16 C26 22, 20 22, 16 26 Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Your Passion</h3>
              <p className="text-gray-600">
                Discover opportunities that align with causes you truly care about
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-electric-red">
              <div className="bg-electric-blue rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Locally</h3>
              <p className="text-gray-600">
                Join your community and make a real difference right where you live
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-electric-blue">
              <div className="bg-electric-red rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="white">
                  <path d="M16 26 C12 22, 6 22, 6 16 C6 13, 9 10, 12 13 C14 15, 16 18, 16 18 C16 18, 18 15, 20 13 C23 10, 26 13, 26 16 C26 22, 20 22, 16 26 Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Impact</h3>
              <p className="text-gray-600">
                See the difference you're making with personalized impact tracking
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border-4 border-electric-blue">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to make a difference?
            </h2>
            <p className="text-gray-600 mb-6">
              Let's find ways you can give back in your community. It only takes a few minutes to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/onboarding')}
                className="bg-electric-red text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-electric-red-dark transition-colors inline-flex items-center justify-center gap-2 shadow-lg"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={handleDemoLogin}
                className="bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-700 transition-colors inline-flex items-center justify-center gap-2 shadow-lg"
              >
                🚀 Demo Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;