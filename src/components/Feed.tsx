import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useMobile } from '../hooks/useMobile';
import { motion } from 'framer-motion';
import Navigation from './Navigation';
import SwipeInterface from './SwipeInterface';
import MobileSwipeInterface from './MobileSwipeInterface';
import GamificationStats from './GamificationStats';
import LocationInput from './LocationInput';
import { VolunteerEvent, mockEvents } from '../data/mockData';
import { quickSearch } from '../services/opportunityAggregator';
import { 
  MapPin, 
  Settings, 
  Loader2, 
  Sparkles, 
  Users, 
  TrendingUp,
  Clock,
  Zap,
  Heart
} from 'lucide-react';

interface FeedProps {
  onOpenAIChat: () => void;
}

const Feed: React.FC<FeedProps> = ({ onOpenAIChat }) => {
  const navigate = useNavigate();
  const { user, updateStats, incrementStreak } = useUser();
  const { isMobile } = useMobile();
  
  const [events, setEvents] = useState<VolunteerEvent[]>([]);
  const [dataSource, setDataSource] = useState<'sample' | 'real'>('sample');
  const [isLoadingReal, setIsLoadingReal] = useState(false);
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const [tempLocation, setTempLocation] = useState('');
  const [tempRadius, setTempRadius] = useState(25);
  const [currentRadius, setCurrentRadius] = useState(25);

  // Initialize with sample data
  useEffect(() => {
    if (dataSource === 'sample') {
      setEvents(mockEvents);
    }
  }, [dataSource]);

  // Track user activity
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
    console.log('Matched with:', event.title);
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

  const handleLoadRealOpportunities = async () => {
    if (!user?.coordinates) {
      alert('Please set your location first to load real opportunities.');
      setShowLocationSettings(true);
      return;
    }

    setIsLoadingReal(true);

    try {
      const searchConfig = {
        coordinates: user.coordinates,
        location: user.preferences.location,
        interests: user.preferences.interests,
        radius: currentRadius
      };

      const opportunities = await quickSearch(searchConfig);
      
      if (opportunities.length > 0) {
        setEvents(opportunities);
        setDataSource('real');
      } else {
        alert('No opportunities found in your area. Try expanding your search radius or check back later.');
      }
    } catch (error) {
      console.error('Failed to load real opportunities:', error);
      alert('Failed to load opportunities. Please try again.');
    } finally {
      setIsLoadingReal(false);
    }
  };

  const handleLocationUpdate = (location: string, coordinates?: { lat: number; lng: number }) => {
    if (user && coordinates) {
      const updatedUser = {
        ...user,
        preferences: { ...user.preferences, location },
        coordinates
      };
      // This would typically use a context method to update the user
      setTempLocation(location);
      setShowLocationSettings(false);
    }
  };

  const handleLocationSettingsOpen = () => {
    setTempLocation(user?.preferences.location || '');
    setTempRadius(currentRadius);
    setShowLocationSettings(true);
  };

  const handleLocationSettingsSave = () => {
    if (tempLocation && user) {
      // Update user location would go here
      setCurrentRadius(tempRadius);
      setShowLocationSettings(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <div className="text-center text-white p-8">
          <h2 className="text-2xl font-bold mb-4">Welcome to Be The People!</h2>
          <p className="mb-6">Please complete your profile to start discovering volunteer opportunities.</p>
          <button
            onClick={() => navigate('/onboarding')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <Navigation onOpenAIChat={onOpenAIChat} />
        
        <div className="flex-1 overflow-hidden">
          {isMobile ? (
            <div className="flex flex-col h-full">
              {/* Mobile Header Card */}
              <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 mx-4 mt-4 rounded-2xl p-4">
                {/* Mobile User Greeting */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-xl font-bold text-white">
                      Hey {user.name}! 👋
                    </h1>
                    <p className="text-white/70 text-sm">
                      Ready to make a difference?
                    </p>
                  </div>
                </div>

                {/* Real/Sample Toggle - Mobile */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setEvents(mockEvents) || setDataSource('sample')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      dataSource === 'sample'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <Sparkles className="h-4 w-4" />
                    Sample
                  </button>
                  
                  <button
                    onClick={handleLoadRealOpportunities}
                    disabled={isLoadingReal}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      dataSource === 'real'
                        ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {isLoadingReal ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    Real
                  </button>
                </div>

                {/* Mobile Stats */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-500/20 rounded-full mb-1 mx-auto">
                      <span className="text-orange-400 text-sm">🔥</span>
                    </div>
                    <p className="text-white font-bold text-lg">{user.stats.streak}</p>
                    <p className="text-white/60 text-2xs">Streak</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-yellow-500/20 rounded-full mb-1 mx-auto">
                      <Star className="w-4 h-4 text-yellow-400" />
                    </div>
                    <p className="text-white font-bold text-lg">{user.stats.points}</p>
                    <p className="text-white/60 text-2xs">Points</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-pink-500/20 rounded-full mb-1 mx-auto">
                      <Heart className="w-4 h-4 text-pink-400" />
                    </div>
                    <p className="text-white font-bold text-lg">{user.stats.matches}</p>
                    <p className="text-white/60 text-2xs">Matches</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-500/20 rounded-full mb-1 mx-auto">
                      <Clock className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-white font-bold text-lg">{user.stats.volunteerHours}</p>
                    <p className="text-white/60 text-2xs">Hours</p>
                  </div>
                </div>

                {/* Mobile Location Toggle */}
                <button
                  onClick={handleLocationSettingsOpen}
                  className="flex items-center justify-between w-full px-3 py-2 bg-white/10 rounded-xl text-white/70 text-sm hover:bg-white/20 active:bg-white/30 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{user.preferences.location}</span>
                  </div>
                  <Settings className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile Swipe Interface */}
              <div className="flex-1">
                <MobileSwipeInterface
                  events={events}
                  onMatch={handleMatch}
                  onSkip={handleSkip}
                  onCardClick={handleCardClick}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6 p-6 h-full">
              {/* Left Sidebar - Stats */}
              <div className="col-span-3 space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Hey {user.name}!
                      </h2>
                      <p className="text-white/70 text-sm">Level {user.stats.level} Volunteer</p>
                    </div>
                  </div>
                  
                  <GamificationStats stats={user.stats} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                >
                  <h3 className="text-lg font-bold text-white mb-4">Your Preferences</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-white/70">Location:</span>
                      <p className="text-white font-medium">{user.preferences.location}</p>
                    </div>
                    <div>
                      <span className="text-white/70">Interests:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.preferences.interests.slice(0, 3).map((interest, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-white/70">Availability:</span>
                      <p className="text-white font-medium">{user.preferences.availability}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Center - Swipe Interface */}
              <div className="col-span-6">
                <div className="h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
                  <SwipeInterface
                    events={events}
                    onMatch={handleMatch}
                    onSkip={handleSkip}
                    onCardClick={handleCardClick}
                  />
                </div>
              </div>

              {/* Right Sidebar - Upcoming Events & Tips */}
              <div className="col-span-3 space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                >
                  <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleLocationSettingsOpen}
                      className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                    >
                      <MapPin className="h-5 w-5" />
                      <span>Update Location</span>
                    </button>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                    >
                      <TrendingUp className="h-5 w-5" />
                      <span>View Dashboard</span>
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
                >
                  <h3 className="text-lg font-bold text-white mb-4">Pro Tips</h3>
                  <div className="space-y-3 text-sm text-white/70">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400">💡</span>
                      <p>Swipe right on opportunities that match your schedule</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400">✨</span>
                      <p>Build streaks by logging in daily</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-400">🎯</span>
                      <p>Use the AI assistant for personalized recommendations</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* Desktop-only data source toggle - moved to bottom left corner */}
          {!isMobile && dataSource === 'sample' && !isLoadingReal && (
            <div className="fixed bottom-6 left-6 z-20">
              <div className="flex gap-2">
                <button
                  onClick={() => setEvents(mockEvents)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-xl transition-all ${
                    dataSource === 'sample'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg border border-white/20'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  Sample
                </button>
                
                <button
                  onClick={handleLoadRealOpportunities}
                  disabled={isLoadingReal}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-xl transition-all ${
                    dataSource === 'real'
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg border border-white/20'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {isLoadingReal ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                  Real
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Location Settings Modal */}
      {showLocationSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Update Location</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Location
                </label>
                <LocationInput
                  value={tempLocation}
                  onChange={(location, coordinates) => {
                    setTempLocation(location);
                    if (coordinates && user) {
                      handleLocationUpdate(location, coordinates);
                    }
                  }}
                  placeholder="Enter your city or zip code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Radius: {tempRadius} miles
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={tempRadius}
                  onChange={(e) => setTempRadius(parseInt(e.target.value))}
                  className="w-full slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 miles</span>
                  <span>100 miles</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLocationSettings(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLocationSettingsSave}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;