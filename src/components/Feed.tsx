import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { mockEvents, VolunteerEvent } from '../data/mockData';
import { quickSearch, searchByUserInterests } from '../services/opportunityAggregator';
import { calculateDistance } from '../services/locationService';
import Navigation from './Navigation';
import SwipeInterface from './SwipeInterface';
import AIChat from './AIChat';
import { Calendar, MapPin, Users, Heart, RefreshCw, Sparkles, List, MessageCircle, X, Check, Clock, Mail, Phone, User, Zap, Trophy, Target, TrendingUp } from 'lucide-react';

const Feed: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateStats, incrementStreak } = useUser();
  const [selectedEvent, setSelectedEvent] = useState<VolunteerEvent | null>(null);
  const [realOpportunities, setRealOpportunities] = useState<VolunteerEvent[]>([]);
  const [isLoadingReal, setIsLoadingReal] = useState(false);
  const [viewMode, setViewMode] = useState<'swipe' | 'grid'>('swipe');
  const [dataSource, setDataSource] = useState<'real' | 'sample'>('sample');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [showAchievement, setShowAchievement] = useState<string | null>(null);

  // Auto-load real opportunities when component mounts
  useEffect(() => {
    const autoLoadRealOpportunities = async () => {
      if (user?.preferences.location && user?.coordinates && realOpportunities.length === 0) {
        console.log('🚀 Auto-loading real opportunities for:', user.preferences.location);
        setIsLoadingReal(true);
        try {
          const opportunities = await quickSearch({
            location: user.preferences.location,
            coordinates: user.coordinates,
            interests: user.preferences.interests,
            availability: user.preferences.availability,
            contributionTypes: user.preferences.contributionType,
            radius: 25
          });
          console.log('✅ Auto-loaded opportunities:', opportunities.length);
          setRealOpportunities(opportunities);
          if (opportunities.length > 0) {
            setDataSource('real');
          }
        } catch (error) {
          console.error('❌ Failed to auto-load opportunities:', error);
        } finally {
          setIsLoadingReal(false);
        }
      }
    };

    if (user) {
      autoLoadRealOpportunities();
      incrementStreak(); // Update streak on app open
    }
  }, [user?.preferences.location, user?.coordinates, user?.preferences.interests, realOpportunities.length]);

  // Check for new achievements and show notifications
  useEffect(() => {
    if (user?.achievements) {
      const recentlyUnlocked = user.achievements.find(
        achievement => achievement.unlockedAt && 
        Date.now() - achievement.unlockedAt.getTime() < 5000 // Within last 5 seconds
      );
      
      if (recentlyUnlocked && !showAchievement) {
        setShowAchievement(recentlyUnlocked.id);
        setTimeout(() => setShowAchievement(null), 4000);
      }
    }
  }, [user?.achievements]);

  const loadRealOpportunities = async () => {
    console.log('🎯 Loading real opportunities...');
    setIsLoadingReal(true);
    try {
      const opportunities = await quickSearch({
        location: user?.preferences.location || 'Your area',
        coordinates: user?.coordinates,
        interests: user?.preferences.interests || [],
        availability: user?.preferences.availability || '',
        contributionTypes: user?.preferences.contributionType || [],
        radius: 25
      });
      console.log('⚡ Real opportunities found:', opportunities.length);
      setRealOpportunities(opportunities);
      setDataSource('real');
      
      if (opportunities.length === 0) {
        alert('No real opportunities found in your area. Showing sample opportunities instead.');
        setDataSource('sample');
      }
    } catch (error) {
      console.error('❌ Real search failed:', error);
      alert('Unable to load real opportunities. Please check your connection.');
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

      // Sort by distance (virtual events first, then by distance)
      events.sort((a, b) => {
        if (a.type === 'virtual' && b.type !== 'virtual') return -1;
        if (b.type === 'virtual' && a.type !== 'virtual') return 1;
        if (a.distance === undefined && b.distance === undefined) return 0;
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
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
  }, [user, dataSource, realOpportunities]);

  const handleMatch = (event: VolunteerEvent) => {
    console.log('💚 User matched with:', event.title);
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
    console.log('👎 User skipped:', event.title);
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
      <div className="fixed top-20 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-xl shadow-2xl animate-bounce border-2 border-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{achievement.icon}</span>
          <div>
            <h3 className="font-bold">Achievement Unlocked!</h3>
            <p className="text-sm">{achievement.title}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      <AchievementNotification />
      
      <div className="container mx-auto px-4 py-6">
        {/* Enhanced Header with Gamification */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {user ? `Hey ${user.name}! 🔥` : 'Volunteer Opportunities'}
            </h1>
          </div>
          
          {/* Enhanced Gamification Stats */}
          {user && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-xl p-4 border border-orange-200 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-2xl">🔥</span>
                  <span className="text-2xl font-bold text-orange-600">{user.stats.streak}</span>
                </div>
                <p className="text-xs text-gray-600 font-medium">Day Streak</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-4 border border-blue-200 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-2xl">⚡</span>
                  <span className="text-2xl font-bold text-blue-600">{user.stats.points}</span>
                </div>
                <p className="text-xs text-gray-600 font-medium">Points</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 border border-green-200 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-2xl">💚</span>
                  <span className="text-2xl font-bold text-green-600">{user.stats.matches}</span>
                </div>
                <p className="text-xs text-gray-600 font-medium">Matches</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4 border border-purple-200 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-2xl">🏆</span>
                  <span className="text-2xl font-bold text-purple-600">{user.stats.level}</span>
                </div>
                <p className="text-xs text-gray-600 font-medium">Level</p>
              </div>
            </div>
          )}
          
          {/* Level Progress Bar */}
          {user && (
            <div className="max-w-md mx-auto mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Level {user.stats.level}</span>
                <span className="text-sm text-gray-500">
                  {user.stats.points % 500}/500 to Level {user.stats.level + 1}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${(user.stats.points % 500) / 500 * 100}%` }}
                />
              </div>
            </div>
          )}
          
          <p className="text-gray-600">
            {dataSource === 'real' && realOpportunities.length > 0
                ? `Real opportunities near ${user?.preferences.location} 📍`
                : 'Discover your next adventure'
            }
          </p>
        </div>

        {/* Simplified Controls */}
        <div className="flex flex-col items-center space-y-4 mb-6">
          {/* View Mode Toggle */}
          <div className="flex bg-white rounded-full p-1 shadow-lg border-2 border-gradient">
            <button
              onClick={() => setViewMode('swipe')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                viewMode === 'swipe'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              💕 Swipe
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4 inline mr-1" />
              Browse
            </button>
          </div>

          {/* Simplified Data Source Toggle */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (realOpportunities.length > 0) {
                  setDataSource('real');
                } else {
                  loadRealOpportunities();
                }
              }}
              disabled={isLoadingReal}
              className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 shadow-lg ${
                dataSource === 'real' && realOpportunities.length > 0
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                  : 'bg-white text-green-600 border-2 border-green-500 hover:bg-green-50 disabled:opacity-50'
              }`}
            >
              {isLoadingReal ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Finding...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  {realOpportunities.length > 0 ? 'Real Opportunities' : 'Find Real Opportunities'}
                </>
              )}
            </button>

            <button
              onClick={() => setDataSource('sample')}
              className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 shadow-lg ${
                dataSource === 'sample'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white text-purple-600 border-2 border-purple-500 hover:bg-purple-50'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Sample Opportunities
            </button>
          </div>

          {/* Status Info */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm text-gray-600 border shadow-sm">
              <span className="font-medium">
                {dataSource === 'real' && realOpportunities.length > 0 
                  ? '🎯 Real Organizations' 
                  : '✨ Sample Data'
                }
              </span>
              <span>•</span>
              <span>{filteredEvents.length} opportunities</span>
              {user?.preferences.location && (
                <>
                  <span>•</span>
                  <span>📍 {user.preferences.location}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'swipe' ? (
          <div className="h-[calc(100vh-400px)] md:h-[600px]">
            <SwipeInterface
              events={filteredEvents}
              onMatch={handleMatch}
              onSkip={handleSkip}
              onCardClick={setSelectedEvent}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden border hover:border-purple-300 group transform hover:-translate-y-1"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="relative">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                      event.type === 'virtual' ? 'bg-blue-500' :
                      event.type === 'hybrid' ? 'bg-purple-500' :
                      'bg-green-500'
                    }`}>
                      {event.type}
                    </span>
                  </div>
                  {(event as any).distance && (
                    <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {(event as any).distance.toFixed(1)} mi
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors leading-tight flex-1 pr-2">
                      {event.title}
                    </h3>
                    <Heart className="h-5 w-5 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 ml-2" />
                  </div>

                  <p className="text-purple-600 font-medium mb-2 text-sm">{event.organization}</p>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                    {event.description.length > 120 
                      ? `${event.description.substring(0, 120)}...` 
                      : event.description
                    }
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-2" />
                      <span className="truncate">{event.date}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-2" />
                      <span className="truncate max-w-[200px]">
                        {event.location.length > 30 
                          ? `${event.location.substring(0, 30)}...` 
                          : event.location
                        }
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{event.spotsAvailable} spots</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.frequency === 'one-time' ? 'bg-blue-100 text-blue-800' :
                      event.frequency === 'weekly' ? 'bg-green-100 text-green-800' :
                      event.frequency === 'monthly' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.frequency}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && !isLoadingReal && (
              <div className="col-span-full text-center py-12">
                <div className="max-w-md mx-auto">
                  <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
                  <p className="text-gray-600 mb-4">
                    Try loading real opportunities or use the AI assistant to find perfect matches.
                  </p>
                  <button
                    onClick={() => setIsAIChatOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all"
                  >
                    Ask AI Assistant
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Event Detail Modal - Enhanced with gamification */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="relative">
                <img
                  src={selectedEvent.imageUrl}
                  alt={selectedEvent.title}
                  className="w-full h-64 object-cover rounded-t-2xl"
                />
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
                    selectedEvent.type === 'virtual' ? 'bg-blue-500' :
                    selectedEvent.type === 'hybrid' ? 'bg-purple-500' :
                    'bg-green-500'
                  }`}>
                    {selectedEvent.type}
                  </span>
                  {selectedEvent.familyFriendly && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-500 text-white">
                      Family Friendly
                    </span>
                  )}
                </div>
                {(selectedEvent as any).distance && (
                  <div className="absolute top-4 right-16 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {(selectedEvent as any).distance.toFixed(1)} mi away
                  </div>
                )}
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Content */}
                  <div className="lg:col-span-2">
                    <div className="mb-6">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h1>
                      <p className="text-xl text-purple-600 font-semibold">{selectedEvent.organization}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-5 w-5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-medium">{selectedEvent.date}</p>
                          <p className="text-sm">{selectedEvent.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-5 w-5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Location</p>
                          <p className="text-sm">{selectedEvent.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-5 w-5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Commitment</p>
                          <p className="text-sm">{selectedEvent.commitment}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-5 w-5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Availability</p>
                          <p className="text-sm">{selectedEvent.spotsAvailable} of {selectedEvent.totalSpots} spots left</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">About this opportunity</h3>
                      <div 
                        className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: selectedEvent.description.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>') 
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">What you'll need</h4>
                        <ul className="space-y-2">
                          {selectedEvent.requirements.map((req, index) => (
                            <li key={index} className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">What you'll gain</h4>
                        <ul className="space-y-2">
                          {selectedEvent.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start">
                              <Heart className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {selectedEvent.skillsNeeded && selectedEvent.skillsNeeded.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Skills needed</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedEvent.skillsNeeded.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Sidebar with Gamification */}
                  <div className="space-y-6">
                    {/* RSVP Card with Points Preview */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {selectedEvent.spotsAvailable > 0 ? 'Join us!' : 'Full'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedEvent.frequency === 'one-time' ? 'bg-blue-100 text-blue-800' :
                            selectedEvent.frequency === 'weekly' ? 'bg-green-100 text-green-800' :
                            selectedEvent.frequency === 'monthly' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedEvent.frequency}
                          </span>
                        </div>
                        
                        {selectedEvent.spotsAvailable > 0 ? (
                          <>
                            <p className="text-gray-600 mb-3">
                              {selectedEvent.spotsAvailable} {selectedEvent.spotsAvailable === 1 ? 'spot' : 'spots'} remaining
                            </p>
                            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-3 mb-3">
                              <div className="flex items-center gap-2 text-sm text-green-700">
                                <Zap className="h-4 w-4" />
                                <span className="font-medium">+50 points for RSVP!</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p className="text-red-600">This opportunity is currently full</p>
                        )}
                      </div>

                      {selectedEvent.spotsAvailable > 0 && (
                        <button
                          onClick={() => {
                            if (!user) {
                              navigate('/onboarding');
                              return;
                            }
                            alert(`RSVP'd for ${selectedEvent.title}!`);
                            updateStats({
                              ...user.stats,
                              points: user.stats.points + 50,
                              eventsAttended: user.stats.eventsAttended + 1
                            });
                          }}
                          className="w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg transform hover:scale-105"
                        >
                          <Check className="h-5 w-5" />
                          RSVP Now
                        </button>
                      )}
                    </div>

                    {/* Contact Card */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Contact Organizer</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{selectedEvent.contact.name}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                          <a
                            href={`mailto:${selectedEvent.contact.email}`}
                            className="text-green-600 hover:text-green-700 transition-colors"
                          >
                            {selectedEvent.contact.email}
                          </a>
                        </div>
                        
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                          <a
                            href={`tel:${selectedEvent.contact.phone}`}
                            className="text-green-600 hover:text-green-700 transition-colors"
                          >
                            {selectedEvent.contact.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Chat Popup */}
        <AIChat 
          isOpen={isAIChatOpen} 
          onClose={() => setIsAIChatOpen(false)} 
        />
      </div>
    </div>
  );
};

export default Feed;