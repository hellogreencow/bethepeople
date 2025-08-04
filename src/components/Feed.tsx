import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { mockEvents, VolunteerEvent } from '../data/mockData';
import { quickSearch, searchByUserInterests } from '../services/opportunityAggregator';
import { calculateDistance } from '../services/locationService';
import Navigation from './Navigation';
import SwipeInterface from './SwipeInterface';
import GamificationStats from './GamificationStats';
import { motion, AnimatePresence } from 'framer-motion';
import LocationInput from './LocationInput';
import { 
  Calendar, MapPin, Users, Heart, RefreshCw, Sparkles, List, 
  MessageCircle, X, Check, Clock, Mail, Phone, User, Zap, 
  Trophy, Target, TrendingUp, Flame, Star, Shield, RotateCcw,
  Home, Grid3X3, Settings, Sliders
} from 'lucide-react';

interface FeedProps {
  onOpenAIChat: () => void;
}

const Feed: React.FC<FeedProps> = ({ onOpenAIChat }) => {
  const navigate = useNavigate();
  const { user, setUser, updateStats, incrementStreak } = useUser();
  const [selectedEvent, setSelectedEvent] = useState<VolunteerEvent | null>(null);
  const [realOpportunities, setRealOpportunities] = useState<VolunteerEvent[]>([]);
  const [isLoadingReal, setIsLoadingReal] = useState(false);
  const [viewMode, setViewMode] = useState<'swipe' | 'grid'>('swipe');
  const [dataSource, setDataSource] = useState<'real' | 'sample'>('sample');
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const [searchRadius, setSearchRadius] = useState(25);
  const [tempLocation, setTempLocation] = useState('');
  const [tempCoordinates, setTempCoordinates] = useState<{ lat: number; lng: number } | undefined>();
  const [loadingStatus, setLoadingStatus] = useState<{
    isLoading: boolean;
    stage: 'searching' | 'processing' | 'complete';
    message: string;
    progress: number;
    total: number;
  }>({
    isLoading: false,
    stage: 'searching',
    message: '',
    progress: 0,
    total: 0
  });
  
  // Feature flag to disable auto-loading real opportunities (causing performance issues)
  const ENABLE_AUTO_LOAD_REAL = false;

  // Increment streak only once when component mounts and user is available
  useEffect(() => {
    if (user) {
      incrementStreak();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - run only once on mount

  // Auto-load real opportunities when component mounts
  useEffect(() => {
    const autoLoadRealOpportunities = async () => {
      if (!ENABLE_AUTO_LOAD_REAL) {
        return;
      }
      
      if (user?.preferences.location && user?.coordinates && realOpportunities.length === 0) {
        setIsLoadingReal(true);
        try {
          const opportunities = await quickSearch({
            location: user.preferences.location,
            coordinates: user.coordinates,
            interests: user.preferences.interests,
            availability: user.preferences.availability,
            contributionTypes: user.preferences.contributionType,
            radius: searchRadius
          });
          setRealOpportunities(opportunities);
          if (opportunities.length > 0) {
            setDataSource('real');
          }
        } catch (error) {
          console.error('Failed to auto-load opportunities:', error);
        } finally {
          setIsLoadingReal(false);
        }
      }
    };

    if (user) {
      autoLoadRealOpportunities();
    }
  }, [user?.preferences.location, user?.coordinates, user?.preferences.interests, realOpportunities.length, ENABLE_AUTO_LOAD_REAL, searchRadius]);

  // Check for new achievements
  useEffect(() => {
    if (user?.achievements) {
      const recentlyUnlocked = user.achievements.find(
        achievement => achievement.unlockedAt && 
        Date.now() - achievement.unlockedAt.getTime() < 5000
      );
      
      if (recentlyUnlocked && !showAchievement) {
        setShowAchievement(recentlyUnlocked.id);
        setTimeout(() => setShowAchievement(null), 4000);
      }
    }
  }, [user?.achievements, showAchievement]);

  const loadRealOpportunities = async () => {
    // Prevent loading if already loading
    if (isLoadingReal) {
      console.log('Already loading real opportunities');
      return;
    }
    
    setIsLoadingReal(true);
    setLoadingStatus({
      isLoading: true,
      stage: 'searching',
      message: 'Initializing search...',
      progress: 0,
      total: 0
    });
    
    try {
      // Add a minimum loading time to prevent rapid clicking
      const startTime = Date.now();
      
      const opportunities = await quickSearch({
        location: user?.preferences.location || 'Your area',
        coordinates: user?.coordinates,
        interests: user?.preferences.interests || [],
        availability: user?.preferences.availability || '',
        contributionTypes: user?.preferences.contributionType || [],
        radius: searchRadius
      }, (stage, message, current, total) => {
        setLoadingStatus({
          isLoading: true,
          stage,
          message,
          progress: current,
          total
        });
      });
      
      // Ensure minimum loading time of 1 second
      const elapsed = Date.now() - startTime;
      if (elapsed < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - elapsed));
      }
      
      setRealOpportunities(opportunities);
      setDataSource('real');
      
      if (opportunities.length === 0) {
        alert('No real opportunities found in your area. Showing sample opportunities instead.');
        setDataSource('sample');
      }
      
      setLoadingStatus({
        isLoading: false,
        stage: 'complete',
        message: `Found ${opportunities.length} opportunities!`,
        progress: opportunities.length,
        total: opportunities.length
      });
    } catch (error) {
      console.error('Real search failed:', error);
      alert('Unable to load real opportunities. The service is temporarily unavailable. Please try again later.');
      setDataSource('sample');
      setLoadingStatus({
        isLoading: false,
        stage: 'complete',
        message: 'Failed to load opportunities',
        progress: 0,
        total: 0
      });
    } finally {
      setIsLoadingReal(false);
    }
  };

  const getCurrentOpportunities = () => {
    return dataSource === 'real' ? realOpportunities : mockEvents;
  };

  const filteredEvents = useMemo(() => {
    let events = [...getCurrentOpportunities()];

    // Add distance calculation if user has coordinates
    if (user?.coordinates) {
      events = events.map(event => ({
        ...event,
        distance: event.coordinates && event.type !== 'virtual' 
          ? calculateDistance(
              user.coordinates!.lat,
              user.coordinates!.lng,
              event.coordinates.lat,
              event.coordinates.lng
            )
          : undefined
      }));

      // Sort by distance
      events.sort((a, b) => {
        if (a.type === 'virtual' && b.type !== 'virtual') return -1;
        if (b.type === 'virtual' && a.type !== 'virtual') return 1;
        if ((a as any).distance === undefined && (b as any).distance === undefined) return 0;
        if ((a as any).distance === undefined) return 1;
        if ((b as any).distance === undefined) return -1;
        return (a as any).distance - (b as any).distance;
      });
    }

    // Filter by user interests if available
    if (user?.preferences.interests.length && dataSource === 'sample') {
      events = events.filter(event =>
        user.preferences.interests.some(interest =>
          event.category.toLowerCase().includes(interest.toLowerCase())
        )
      );
    }

    return events;
  }, [user, dataSource, realOpportunities, getCurrentOpportunities]);

  const handleMatch = (event: VolunteerEvent) => {
    if (user) {
      updateStats({
        ...user.stats,
        points: user.stats.points + 10,
        matches: user.stats.matches + 1,
        totalSwipes: user.stats.totalSwipes + 1
      });
    }
  };

  const handleSkip = (event: VolunteerEvent) => {
    if (user) {
      updateStats({
        ...user.stats,
        points: user.stats.points + 1,
        totalSwipes: user.stats.totalSwipes + 1
      });
    }
  };

  // Achievement notification component
  const AchievementNotification = () => {
    if (!showAchievement) return null;
    
    const achievement = user?.achievements.find(a => a.id === showAchievement);
    if (!achievement) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.8 }}
        className="fixed top-20 right-4 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl shadow-lg backdrop-blur-sm border border-white/20"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{achievement.icon}</span>
          <div>
            <h3 className="font-bold">Achievement Unlocked!</h3>
            <p className="text-sm">{achievement.title}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 text-white relative overflow-hidden">
      {/* Animated Background Orbs - Made more subtle */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <AnimatePresence>
        {showAchievement && <AchievementNotification />}
      </AnimatePresence>
      
      <div className="relative z-10">
        <Navigation onOpenAIChat={onOpenAIChat} />
        
        <div className="container mx-auto px-4 py-4">
          {/* Compact Header Section */}
          <div className="flex items-center justify-between mb-4">
            {/* Left side - Greeting and mini stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4 flex-1 min-w-0"
            >
              <h1 className="text-lg md:text-2xl font-bold text-white truncate">
                Hey {user?.name || 'there'}! 🔥
              </h1>
              
              {/* Mini stats bar */}
              {user && (
                <div className="hidden sm:flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-400" />
                    <span className="text-sm font-medium">{user.stats.streak}</span>
                  </div>
                  <div className="w-px h-4 bg-white/20" />
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium">{user.stats.points}</span>
                  </div>
                  <div className="w-px h-4 bg-white/20" />
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-pink-400" />
                    <span className="text-sm font-medium">{user.stats.matches}</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right side - View controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 flex-shrink-0"
            >
              {/* View Mode Toggle */}
              <div className="flex bg-white/5 backdrop-blur-sm rounded-full p-1 border border-white/10">
                <button
                  onClick={() => setViewMode('swipe')}
                  className={`px-3 py-2 rounded-full font-medium transition-all text-xs flex items-center gap-1 ${
                    viewMode === 'swipe'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  <Heart className="h-3 w-3" />
                  <span className="hidden sm:inline">Swipe</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-full font-medium transition-all text-xs flex items-center gap-1 ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  <Grid3X3 className="h-3 w-3" />
                  <span className="hidden sm:inline">Browse</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Mobile-specific info bar */}
          <div className="sm:hidden flex items-center justify-between mb-4 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
            {user && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Flame className="h-3 w-3 text-orange-400" />
                  <span className="text-xs font-medium text-white">{user.stats.streak}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs font-medium text-white">{user.stats.points}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-pink-400" />
                  <span className="text-xs font-medium text-white">{user.stats.matches}</span>
                </div>
              </div>
            )}
            <div className="text-xs text-white/50">
              {filteredEvents.length} opportunities
            </div>
          </div>

          {/* Location button - mobile */}
          {user && (
            <div className="sm:hidden mb-4">
              <button
                onClick={() => {
                  setTempLocation(user.preferences.location);
                  setTempCoordinates(user.coordinates);
                  setShowLocationSettings(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors text-sm"
              >
                <MapPin className="h-4 w-4" />
                <span>{user.preferences.location || 'Set Location'}</span>
                <span className="text-white/50">({searchRadius}mi)</span>
              </button>
            </div>
          )}

          {/* Subtle data source toggle - moved to bottom left corner */}
          <div className="fixed bottom-6 left-6 z-20">
            {/* Pointing arrow and tooltip for Real button - shows automatically on first visit */}
            {dataSource === 'sample' && !isLoadingReal && realOpportunities.length === 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute -top-12 left-6 flex items-center gap-2 pointer-events-none z-30"
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="text-yellow-400 text-2xl"
                >
                  ⬇️
                </motion.div>
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg animate-pulse">
                  Try Real Opportunities!
                </div>
              </motion.div>
            )}
            
            <div className="flex flex-col gap-2">
              <motion.button
                animate={dataSource === 'sample' && !isLoadingReal && realOpportunities.length === 0 ? {
                  boxShadow: [
                    '0 0 0 0 rgba(34, 197, 94, 0)',
                    '0 0 0 4px rgba(34, 197, 94, 0.3)',
                    '0 0 0 0 rgba(34, 197, 94, 0)'
                  ]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                onClick={() => {
                  if (realOpportunities.length > 0) {
                    setDataSource('real');
                  } else {
                    loadRealOpportunities();
                  }
                }}
                disabled={isLoadingReal}
                className={`px-4 py-2 rounded-full font-medium transition-all text-xs flex items-center gap-2 backdrop-blur-xl border ${
                  dataSource === 'real' && realOpportunities.length > 0
                    ? 'bg-green-500/20 text-green-300 border-green-500/30'
                    : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 disabled:opacity-50'
                }`}
              >
                {isLoadingReal ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Zap className="h-3 w-3" />
                    Real
                  </>
                )}
              </motion.button>

              <button
                onClick={() => setDataSource('sample')}
                className={`px-4 py-2 rounded-full font-medium transition-all text-xs flex items-center gap-2 backdrop-blur-xl border ${
                  dataSource === 'sample'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                }`}
              >
                <Sparkles className="h-3 w-3" />
                Sample
              </button>
            </div>
          </div>

          {/* Main Content - Full height focus on cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative"
            style={{ height: 'calc(100vh - 240px)' }}
          >
            {viewMode === 'swipe' ? (
              <div className="h-full">
                <SwipeInterface
                  events={filteredEvents}
                  onMatch={handleMatch}
                  onSkip={handleSkip}
                  onCardClick={setSelectedEvent}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-full pb-20">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all cursor-pointer group shadow-lg"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="relative">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-sm ${
                          event.type === 'virtual' ? 'bg-blue-500/80' :
                          event.type === 'hybrid' ? 'bg-purple-500/80' :
                          'bg-green-500/80'
                        }`}>
                          {event.type}
                        </span>
                      </div>
                      {(event as any).distance && (
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                          {(event as any).distance.toFixed(1)} mi
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
                          {event.title}
                        </h3>
                        <p className="text-purple-300 font-medium text-sm line-clamp-1">{event.organization}</p>
                      </div>

                      <p className="text-white/70 text-sm line-clamp-2">
                        {event.description}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-white/60">
                          <Calendar className="h-3 w-3 mr-2" />
                          {event.date}
                        </div>
                        <div className="flex items-center text-xs text-white/60">
                          <MapPin className="h-3 w-3 mr-2" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center text-xs text-white/60">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{event.spotsAvailable} spots</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.frequency === 'one-time' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          event.frequency === 'weekly' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                          event.frequency === 'monthly' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        }`}>
                          {event.frequency}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Event Detail Modal */}
          <AnimatePresence>
            {selectedEvent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedEvent(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal content */}
                  <div className="relative">
                    <img
                      src={selectedEvent.imageUrl}
                      alt={selectedEvent.title}
                      className="w-full h-64 object-cover rounded-t-2xl"
                    />
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors backdrop-blur-sm"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    
                    {/* Type and Distance Badges */}
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium text-white backdrop-blur-sm ${
                        selectedEvent.type === 'virtual' ? 'bg-blue-500/80' :
                        selectedEvent.type === 'hybrid' ? 'bg-purple-500/80' :
                        'bg-green-500/80'
                      }`}>
                        {selectedEvent.type}
                      </span>
                      {selectedEvent.familyFriendly && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-500/80 text-white backdrop-blur-sm">
                          Family Friendly
                        </span>
                      )}
                    </div>
                    
                    {/* Match Percentage */}
                    <div className="absolute bottom-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm shadow-lg">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current" />
                        {Math.floor((selectedEvent.id.charCodeAt(0) + selectedEvent.id.charCodeAt(1)) % 30) + 70}% Match
                      </div>
                    </div>
                  </div>

                  <div className="p-8 text-white">
                    {/* Header with share/save buttons */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h1 className="text-3xl font-bold mb-2">{selectedEvent.title}</h1>
                        <p className="text-xl text-purple-300 font-semibold">{selectedEvent.organization}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors">
                          <Heart className="h-5 w-5" />
                        </button>
                        <button className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors">
                          <Star className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Key Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-xs text-white/60">Date</p>
                          <p className="text-sm font-medium">{selectedEvent.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-xs text-white/60">Time</p>
                          <p className="text-sm font-medium">{selectedEvent.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="text-xs text-white/60">Location</p>
                          <p className="text-sm font-medium truncate">{(selectedEvent as any).distance ? `${(selectedEvent as any).distance.toFixed(1)} mi away` : selectedEvent.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-orange-400" />
                        <div>
                          <p className="text-xs text-white/60">Spots</p>
                          <p className="text-sm font-medium">{selectedEvent.spotsAvailable} left</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="prose prose-invert max-w-none">
                          <p className="text-white/80 leading-relaxed">
                            {selectedEvent.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <h4 className="font-semibold mb-3">What you'll need</h4>
                            <ul className="space-y-2">
                              {selectedEvent.requirements.map((req, index) => (
                                <li key={index} className="flex items-start">
                                  <Check className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-white/80 text-sm">{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <h4 className="font-semibold mb-3">What you'll gain</h4>
                            <ul className="space-y-2">
                              {selectedEvent.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-start">
                                  <Heart className="h-5 w-5 text-pink-400 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-white/80 text-sm">{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        {/* Skills Needed Section */}
                        {selectedEvent.skillsNeeded && selectedEvent.skillsNeeded.length > 0 && (
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Target className="h-5 w-5 text-purple-400" />
                              Skills Needed
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedEvent.skillsNeeded.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Location Details */}
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-green-400" />
                            Location Details
                          </h4>
                          <p className="text-white/80 text-sm mb-2">{selectedEvent.location}</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-white/60">
                              <Clock className="h-4 w-4" />
                              <span>Commitment: {selectedEvent.commitment}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/60">
                              <RotateCcw className="h-4 w-4" />
                              <span>Frequency: {selectedEvent.frequency}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30 backdrop-blur-sm">
                          <div className="mb-4">
                            <span className="text-2xl font-bold">
                              {selectedEvent.spotsAvailable > 0 ? 'Join us!' : 'Full'}
                            </span>
                          </div>
                          
                          {selectedEvent.spotsAvailable > 0 && (
                            <>
                              <p className="text-white/80 mb-3">
                                {selectedEvent.spotsAvailable} spots remaining
                              </p>
                              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-3 mb-3 border border-green-500/30">
                                <div className="flex items-center gap-2 text-sm text-green-300">
                                  <Zap className="h-4 w-4" />
                                  <span className="font-medium">+50 points for RSVP!</span>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  if (!user) {
                                    navigate('/onboarding');
                                    return;
                                  }
                                  alert(`Successfully RSVP'd for ${selectedEvent.title}! You've earned 50 points! 🎉`);
                                  updateStats({
                                    ...user.stats,
                                    points: user.stats.points + 50,
                                    eventsAttended: user.stats.eventsAttended + 1
                                  });
                                  setSelectedEvent(null);
                                }}
                                className="w-full py-3 px-4 rounded-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                              >
                                <Check className="h-5 w-5" />
                                RSVP Now
                              </button>
                              
                              <button
                                onClick={() => {
                                  const eventDate = new Date(selectedEvent.date + ' ' + selectedEvent.time);
                                  const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
                                  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(selectedEvent.title)}&dates=${eventDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(selectedEvent.description)}&location=${encodeURIComponent(selectedEvent.location)}`;
                                  window.open(calendarUrl, '_blank');
                                }}
                                className="w-full py-2 px-4 rounded-lg font-medium bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all border border-white/20 flex items-center justify-center gap-2"
                              >
                                <Calendar className="h-4 w-4" />
                                Add to Calendar
                              </button>
                            </>
                          )}
                        </div>

                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                          <h3 className="font-semibold mb-4">Contact Organizer</h3>
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center">
                              <User className="h-5 w-5 text-white/40 mr-3" />
                              <span className="text-white/80">{selectedEvent.contact.name}</span>
                            </div>
                            <div className="flex items-center">
                              <Mail className="h-5 w-5 text-white/40 mr-3" />
                              <a href={`mailto:${selectedEvent.contact.email}`} className="text-purple-300 hover:text-purple-200">
                                {selectedEvent.contact.email}
                              </a>
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-5 w-5 text-white/40 mr-3" />
                              <a href={`tel:${selectedEvent.contact.phone}`} className="text-purple-300 hover:text-purple-200">
                                {selectedEvent.contact.phone}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Progress Modal */}
          <AnimatePresence>
            {loadingStatus.isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 w-full max-w-md p-6"
                >
                  <div className="flex items-center justify-center mb-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="mr-3"
                    >
                      <MapPin className="h-8 w-8 text-purple-400" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white">Finding Opportunities</h2>
                  </div>
                  
                  {/* Status Message */}
                  <p className="text-white/70 text-center mb-4">{loadingStatus.message}</p>
                  
                  {/* Progress Bar */}
                  {loadingStatus.stage === 'processing' && loadingStatus.total > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-white/50 mb-1">
                        <span>Processing organizations</span>
                        <span>{loadingStatus.progress} / {loadingStatus.total}</span>
                      </div>
                      <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(loadingStatus.progress / loadingStatus.total) * 100}%` }}
                          transition={{ duration: 0.3 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Searching Animation */}
                  {loadingStatus.stage === 'searching' && (
                    <div className="flex justify-center gap-2 mb-4">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                          className="w-2 h-2 bg-purple-400 rounded-full"
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Tips */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="text-xs text-white/50 text-center"
                  >
                    💡 Tip: We're searching real volunteer organizations near you
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Location Settings Modal */}
          <AnimatePresence>
            {showLocationSettings && user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowLocationSettings(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 w-full max-w-md p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-2xl font-bold text-white mb-4">Location Settings</h2>
                  
                  {/* Location Input */}
                  <div className="mb-6">
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Your Location
                    </label>
                    <LocationInput
                      value={tempLocation}
                      onChange={(location, coordinates) => {
                        setTempLocation(location);
                        setTempCoordinates(coordinates);
                      }}
                      placeholder="Enter your city or zip code"
                      className="dark"
                    />
                  </div>
                  
                  {/* Search Radius Slider */}
                  <div className="mb-6">
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Search Radius: {searchRadius} miles
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={searchRadius}
                      onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, rgb(168 85 247) 0%, rgb(168 85 247) ${(searchRadius - 5) / 45 * 100}%, rgb(255 255 255 / 0.2) ${(searchRadius - 5) / 45 * 100}%, rgb(255 255 255 / 0.2) 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-white/50 mt-1">
                      <span>5 mi</span>
                      <span>25 mi</span>
                      <span>50 mi</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowLocationSettings(false)}
                      className="flex-1 py-2 px-4 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (tempLocation && tempCoordinates) {
                          // Update user preferences
                          const updatedUser = {
                            ...user,
                            preferences: {
                              ...user.preferences,
                              location: tempLocation
                            },
                            coordinates: tempCoordinates
                          };
                          setUser(updatedUser);
                          
                          // Clear real opportunities to trigger fresh search
                          setRealOpportunities([]);
                          
                          // If currently viewing real opportunities, trigger a new search
                          if (dataSource === 'real') {
                            loadRealOpportunities();
                          }
                        }
                        setShowLocationSettings(false);
                      }}
                      disabled={!tempLocation || !tempCoordinates}
                      className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Update Location
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Feed;