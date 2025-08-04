import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './components/Welcome';
import Onboarding from './components/Onboarding';
import Feed from './components/Feed';
import EventDetail from './components/EventDetail';
import Dashboard from './components/Dashboard';
import AIChat from './components/AIChat';
import { UserProvider } from './context/UserContext';

function App() {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/feed" element={<Feed onOpenAIChat={() => setIsAIChatOpen(true)} />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/dashboard" element={<Dashboard onOpenAIChat={() => setIsAIChatOpen(true)} />} />
            <Route path="*" element={<div className="text-white p-4">404 - Route not found: {window.location.pathname}</div>} />
          </Routes>
          
          {/* AI Chat at App level - can overlay entire page */}
          <AIChat 
            isOpen={isAIChatOpen} 
            onClose={() => setIsAIChatOpen(false)} 
          />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;