import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Navigation from './Navigation';
import SwipeInterface from './SwipeInterface';
import MobileSwipeInterface from './MobileSwipeInterface';
import GamificationStats from './GamificationStats';
import { mockEvents, VolunteerEvent } from '../data/mockData';
import { useMobile } from '../hooks/useMobile';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Settings, 
  Filter, 
  Sparkles, 
  Zap,
  Users,
  Heart,
  Flame,
  Star,
  ChevronDown
} from 'lucide-react';

interface FeedProps {
  onOpenAIChat: () => void;
}

const Feed: React.FC<FeedProps> = ({ onOpenAIChat }) => {
  const navigate = useNavigate();
  const { user, updateStats, incrementStreak } = useUser();
  const { isMobile } = useMobile();
  const [events, setEvents] = useState<VolunteerEvent[]>(mockEvents);
  const [showRealOpportunities, setShowRealOpportunities] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      incrementStreak();
    }
  }, [user, incrementStreak]);

  const handleMatch = (event: VolunteerEvent) => {
    if (user) {
      updateStats({
        matches: user.stats.matches + 1,
        points: user.stats.points + 25,
        totalSwipes: user.stats.totalSwipes + 1
      });
    }
  };

  const handleSkip = (event: VolunteerEvent) => {
    if (user) {
      updateStats({
        totalSwipes: user.stats.totalSwipes + 1
      });
    }
  };

  const handleCardClick = (event: VolunteerEvent) => {
    navigate(`/event/${event.id}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10">
        <Navigation onOpenAIChat={onOpenAIChat} />
        
        {isMobile ? (
          <MobileFeedLayout 
            user={user}
            events={events}
            onMatch={handleMatch}
            onSkip={handleSkip}
            onCardClick={handleCardClick}
            showRealOpportunities={showRealOpportunities}
            setShowRealOpportunities={setShowRealOpportunities}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
        ) : (
          <DesktopFeedLayout 
            user={user}
            events={events}
            onMatch={handleMatch}
            onSkip={handleSkip}
            onCardClick={handleCardClick}
          />
        )}
      </div>
    </div>
  );
};

// Mobile-specific layout component
const MobileFeedLayout: React.FC<{
  user: any;
  events: VolunteerEvent[];
  onMatch: (event: VolunteerEvent) => void;
  onSkip: (event: VolunteerEvent) => void;
  onCardClick: (event: VolunteerEvent) => void;
  showRealOpportunities: boolean;
  setShowRealOpportunities: (show: boolean) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}> = ({ 
  user, 
  events, 
  onMatch, 
  onSkip, 
  onCardClick,
  showRealOpportunities,
  setShowRealOpportunities,
  showFilters,
  setShowFilters
}) => {
  return (
    <div className="flex flex-col h-screen">
      {/* Mobile Header - Single instance */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-white">
              Hey {user.name}! 👋
            </h1>
          </div>
          
          {/* Location button that shows the actual location */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full border border-white/20 transition-all"
          >
            <MapPin className="h-4 w-4 text-white" />
            <span className="text-sm text-white font-medium truncate max-w-24">
              {user.preferences.location}
            </span>
            <ChevronDown className={`h-3 w-3 text-white transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {/* User stats - Single row, compact */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-white font-bold">{user.stats.streak}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-white font-bold">{user.stats.points}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-pink-400" />
              <span className="text-white font-bold">{user.stats.matches}</span>
            </div>
          </div>
          
          {/* Filter/Mode Toggle - Non-overlapping */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRealOpportunities(!showRealOpportunities)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                showRealOpportunities 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}
            >
              {showRealOpportunities ? (
                <>
                  <Zap className="h-3 w-3" />
                  Real
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" />
                  Sample
                </>
              )}
            </button>
          </div>
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-white/20"
          >
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-white">
                <Filter className="h-3 w-3 inline mr-1" />
                All Categories
              </button>
              <button className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-white">
                Distance: 25mi
              </button>
              <button className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-white">
                This Week
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Swipe Interface */}
      <div className="flex-1 overflow-hidden">
        <MobileSwipeInterface
          events={events}
          onMatch={onMatch}
          onSkip={onSkip}
          onCardClick={onCardClick}
        />
      </div>

      {/* Optional CTA for real opportunities - Only show if in sample mode */}
      {!showRealOpportunities && (
        <div className="absolute bottom-20 left-4 right-4 z-20">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowRealOpportunities(true)}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
          >
            <Zap className="h-5 w-5" />
            Try Real Opportunities!
          </motion.button>
        </div>
      )}
    </div>
  );
};

// Desktop layout component
const DesktopFeedLayout: React.FC<{
  user: any;
  events: VolunteerEvent[];
  onMatch: (event: VolunteerEvent) => void;
  onSkip: (event: VolunteerEvent) => void;
  onCardClick: (event: VolunteerEvent) => void;
}> = ({ user, events, onMatch, onSkip, onCardClick }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <GamificationStats stats={user.stats} />
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden">
          <SwipeInterface
            events={events}
            onMatch={onMatch}
            onSkip={onSkip}
            onCardClick={onCardClick}
          />
        </div>
      </div>
    </div>
  );
};

export default Feed;