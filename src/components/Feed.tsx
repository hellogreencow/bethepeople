import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { mockEvents } from '../data/mockData';
import { quickSearch, searchByUserInterests } from '../services/opportunityAggregator';
import { searchVolunteerConnectorOpportunities } from '../services/volunteerConnectorService';
import { searchIdealistVolunteerOpportunities } from '../services/idealistService';
import { calculateDistance } from '../services/locationService';
import Navigation from './Navigation';
import SwipeInterface from './SwipeInterface';
import AIChat from './AIChat';
import { Calendar, MapPin, Users, Heart, RefreshCw, Sparkles, List, MessageCircle, Bot, X, Check, Clock, Mail, Phone, User } from 'lucide-react';

const Feed: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [selectedEvent, setSelectedEvent] = useState<VolunteerEvent | null>(null);
  const [realOpportunities, setRealOpportunities] = useState<any[]>([]);
  const [isLoadingReal, setIsLoadingReal] = useState(false);
  const [viewMode, setViewMode] = useState<'swipe' | 'grid'>('swipe');
  const [dataSource, setDataSource] = useState<'places' | 'sample'>('sample');
  const [searchRadius, setSearchRadius] = useState(25); // miles
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

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
            radius: searchRadius
          });
          console.log('✅ Auto-loaded opportunities:', opportunities.length);
          setRealOpportunities(opportunities);
          setDataSource('places');
        } catch (error) {
          console.error('❌ Failed to auto-load opportunities:', error);
        } finally {
          setIsLoadingReal(false);
        }
      }
    };

    if (user) {
      autoLoadRealOpportunities();
    }
  }, [user?.preferences.location, user?.coordinates, user?.preferences.interests, user?.preferences.availability, user?.preferences.contributionType, searchRadius, realOpportunities.length]);

  const loadRealOpportunities = async () => {
    console.log('🎯 Loading quick opportunities...');
    setIsLoadingReal(true);
    try {
      const opportunities = await quickSearch({
        location: user?.preferences.location || 'Your area',
        coordinates: user?.coordinates,
        interests: user?.preferences.interests || [],
        availability: user?.preferences.availability || '',
        contributionTypes: user?.preferences.contributionType || [],
        radius: searchRadius
      });
      console.log('⚡ Quick search results:', opportunities.length);
      setRealOpportunities(opportunities);
      setDataSource('places');
      
      if (opportunities.length === 0) {
        alert(`No opportunities found within ${searchRadius} miles. Try expanding your search radius or check back later.`);
      }
    } catch (error) {
      console.error('❌ Quick search failed:', error);
      alert('Search temporarily unavailable. Please try again in a few moments.');
    } finally {
      setIsLoadingReal(false);
    }
  };

  const getCurrentOpportunities = () => {
    switch (dataSource) {
      case 'places':
        return realOpportunities;
      case 'sample':
      default:
        return mockEvents;
    }
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

  const handleMatch = (event: any) => {
    console.log('User matched with:', event.title);
    // Could add to user's interested events
  };

  const handleSkip = (event: any) => {
    console.log('User skipped:', event.title);
    // Could track skipped events to improve recommendations
  };

  const getDataSourceLabel = () => {
    switch (dataSource) {
      case 'places':
        return '🎯 Real Organizations';
      case 'sample':
        return '✨ Sample';
      default:
        return 'Opportunities';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Simple Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {user ? `Hey ${user.name}! 👋` : 'Volunteer Opportunities'}
          </h1>
          <p className="text-gray-600">
            {dataSource === 'places' && realOpportunities.length > 0
                ? `Real organizations near ${user?.preferences.location}`
                : 'Discover ways to make a difference'
            }
          </p>
        </div>

        {/* Simple Controls */}
        <div className="flex flex-col items-center space-y-4 mb-6">
          {/* View Mode Toggle */}
          <div className="flex bg-white rounded-full p-1 shadow-sm border-2 border-electric-blue">
            <button
              onClick={() => setViewMode('swipe')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                viewMode === 'swipe'
                  ? 'bg-electric-blue text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              💕 Swipe
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-electric-blue text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4 inline mr-1" />
              List
            </button>
          </div>

          {/* Data Source Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            {/* Real Organizations - Primary Option */}
            <button
              onClick={() => {
                if (realOpportunities.length > 0) {
                  setDataSource('places');
                } else {
                  loadRealOpportunities();
                }
              }}
              disabled={isLoadingReal}
              className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                dataSource === 'places' && realOpportunities.length > 0
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-green-600 border-2 border-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isLoadingReal ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  ⚡
                  {realOpportunities.length > 0 ? 'Real Opportunities' : 'Load Real Opportunities'}
                </>
              )}
            </button>

            {/* VolunteerConnector API - NEW */}
            <button
              onClick={async () => {
                setIsLoadingReal(true);
                try {
                  console.log('🚀 Loading VolunteerConnector opportunities...');
                  const opportunities = await searchVolunteerConnectorOpportunities({
                    regions: ['British Columbia', 'Alberta', 'Ontario'],
                    limit: 25
                  });
                  console.log('✅ VolunteerConnector loaded:', opportunities.length);
                  setRealOpportunities(opportunities);
                  setDataSource('places');
                  
                  if (opportunities.length === 0) {
                    alert('No opportunities found from VolunteerConnector. Try the other sources.');
                  }
                } catch (error) {
                  console.error('❌ VolunteerConnector failed:', error);
                  alert('VolunteerConnector temporarily unavailable. Try other sources.');
                } finally {
                  setIsLoadingReal(false);
                }
              }}
              disabled={isLoadingReal}
              className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                isLoadingReal
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
              }`}
            >
              {isLoadingReal ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  🇨🇦
                  VolunteerConnector
                </>
              )}
            </button>

            {/* Idealist US API - Real US Volunteer Opportunities */}
            <button
              onClick={async () => {
                setIsLoadingReal(true);
                try {
                  console.log('🇺🇸 Loading Idealist US volunteer opportunities...');
                  const opportunities = await searchIdealistVolunteerOpportunities(
                    user?.preferences.location || 'United States',
                    user?.preferences.interests || [],
                    25
                  );
                  console.log('✅ Idealist US loaded:', opportunities.length);
                  setRealOpportunities(opportunities);
                  setDataSource('places');
                  
                  if (opportunities.length === 0) {
                    alert('No opportunities found from Idealist US. Try the other sources.');
                  }
                } catch (error) {
                  console.error('❌ Idealist US failed:', error);
                  alert('Idealist US temporarily unavailable. Try other sources.');
                } finally {
                  setIsLoadingReal(false);
                }
              }}
              disabled={isLoadingReal}
              className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                isLoadingReal
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50'
              }`}
            >
              {isLoadingReal ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  🇺🇸
                  Idealist US
                </>
              )}
            </button>

            {/* AI Chat Assistant - New Feature */}

            {/* Sample Opportunities */}
            <button
              onClick={() => setDataSource('sample')}
              className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                dataSource === 'sample'
                  ? 'bg-electric-red text-white shadow-lg'
                  : 'bg-white text-electric-red border-2 border-electric-red hover:bg-red-50'
              }`}
            >
              <Heart className="h-4 w-4" />
              Sample
            </button>
          </div>

          {/* Status Info */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-sm text-gray-600 border">
              <span className="font-medium">
                {dataSource === 'places' && realOpportunities.length > 0 
                  ? '🇨🇦 Canadian Opportunities' 
                  : getDataSourceLabel()
                }
              </span>
              <span>•</span>
              <span>{filteredEvents.length} opportunities</span>
              {user?.preferences.location && (
                <>
                  <span>•</span>
                  <span>📍 {user.preferences.location}</span>
                  <span>•</span>
                  <span>🎯 {searchRadius} miles</span>
                </>
              )}
            </div>
            
            {/* Radius Control */}
            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="text-sm text-gray-600">Search radius:</span>
              <div className="flex gap-2">
                {[10, 25, 50].map(radius => (
                  <button
                    key={radius}
                    onClick={() => setSearchRadius(radius)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      searchRadius === radius
                        ? 'bg-electric-blue text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {radius} mi
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'swipe' ? (
          <div className="h-[calc(100vh-300px)] md:h-[600px]">
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
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden border hover:border-electric-blue group"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="relative">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
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
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-electric-blue transition-colors leading-tight flex-1 pr-2">
                      {event.title}
                    </h3>
                    <Heart className="h-5 w-5 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 ml-2" />
                  </div>

                  <p className="text-electric-blue font-medium mb-2 text-sm">{event.organization}</p>
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
                    Try loading real organizations or use the AI assistant to find perfect matches.
                  </p>
                  <button
                    onClick={() => setIsAIChatOpen(true)}
                    className="bg-electric-blue text-white px-6 py-2 rounded-full hover:bg-electric-blue-dark transition-colors"
                  >
                    Ask AI Assistant
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Event Detail Modal */}
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
                      <p className="text-xl text-electric-blue font-semibold">{selectedEvent.organization}</p>
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

                    {/* API-specific additional details */}
                    {(selectedEvent as any).activities && (selectedEvent as any).activities.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Activities</h4>
                        <div className="flex flex-wrap gap-2">
                          {(selectedEvent as any).activities.map((activity: any, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                            >
                              {activity.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(selectedEvent as any).duration && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Time Commitment</h4>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center text-blue-800">
                            <Clock className="h-5 w-5 mr-2" />
                            <span className="font-medium">{(selectedEvent as any).duration}</span>
                          </div>
                          <p className="text-blue-700 text-sm mt-1">
                            Duration: {selectedEvent.commitment}
                          </p>
                        </div>
                      </div>
                    )}

                    {(selectedEvent as any).source && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Source</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center text-gray-700">
                            <span className="font-medium">
                              {(selectedEvent as any).source === 'volunteer_connector' && '🇨🇦 VolunteerConnector'}
                              {(selectedEvent as any).source === 'idealist_us' && '🇺🇸 Idealist'}
                              {(selectedEvent as any).source === 'google_places' && '📍 Google Places'}
                              {(selectedEvent as any).source === 'ai_perplexity' && '🤖 AI Generated'}
                              {!(selectedEvent as any).source && '✨ Sample Data'}
                            </span>
                          </div>
                          {(selectedEvent as any).url && (
                            <a
                              href={(selectedEvent as any).url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-electric-blue hover:text-electric-blue-dark text-sm mt-2 inline-block"
                            >
                              View original listing →
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* RSVP Card */}
                    <div className="bg-gray-50 rounded-xl p-6">
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
                          <p className="text-gray-600">
                            {selectedEvent.spotsAvailable} {selectedEvent.spotsAvailable === 1 ? 'spot' : 'spots'} remaining
                          </p>
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
                            // Handle RSVP logic here
                            alert(`RSVP'd for ${selectedEvent.title}!`);
                          }}
                          className="w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700"
                        >
                          <Check className="h-5 w-5" />
                          RSVP Now
                        </button>
                      )}

                      {/* Show original application method if available */}
                      {((selectedEvent as any).applyEmail || (selectedEvent as any).applyUrl) && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="font-medium text-gray-900 mb-2">How to Apply</h5>
                          {(selectedEvent as any).applyEmail && (
                            <a
                              href={`mailto:${(selectedEvent as any).applyEmail}`}
                              className="block w-full py-2 px-4 bg-electric-blue text-white rounded-lg hover:bg-electric-blue-dark transition-colors text-center text-sm mb-2"
                            >
                              Email Application
                            </a>
                          )}
                          {(selectedEvent as any).applyUrl && (
                            <a
                              href={(selectedEvent as any).applyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full py-2 px-4 bg-electric-red text-white rounded-lg hover:bg-electric-red-dark transition-colors text-center text-sm"
                            >
                              Apply Online
                            </a>
                          )}
                        </div>
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
                    {/* Organization Info - Enhanced with API data */}
                    {(selectedEvent as any).organization?.url ? (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">About {selectedEvent.organization}</h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Learn more about this organization and their mission to make a positive impact in the community.
                        </p>
                        <a
                          href={(selectedEvent as any).organization.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 font-medium text-sm"
                        >
                          View Organization Profile →
                        </a>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">About {selectedEvent.organization}</h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Learn more about this organization and their mission to make a positive impact in the community.
                        </p>
                        <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                          Contact for more info
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setSelectedEvent(null);
                        navigate(`/event/${selectedEvent.id}`);
                      }}
                      className="w-full py-2 px-4 bg-electric-blue text-white rounded-lg hover:bg-electric-blue-dark transition-colors"
                    >
                      View Full Details →
                    </button>
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