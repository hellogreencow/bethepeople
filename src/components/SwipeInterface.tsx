import React, { useState, useEffect } from 'react';
import { Check, X, RotateCcw, Sparkles } from 'lucide-react';
import SwipeableCard from './SwipeableCard';
import { VolunteerEvent } from '../data/mockData';
import { useUser } from '../context/UserContext';

interface SwipeInterfaceProps {
  events: VolunteerEvent[];
  onMatch: (event: VolunteerEvent) => void;
  onSkip: (event: VolunteerEvent) => void;
  onCardClick?: (event: VolunteerEvent) => void;
}

const SwipeInterface: React.FC<SwipeInterfaceProps> = ({
  events,
  onMatch,
  onSkip,
  onCardClick
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { user } = useUser();

  const currentEvent = events[currentIndex];
  const nextEvent = events[currentIndex + 1];

  const handleSwipeRight = (event: VolunteerEvent) => {
    if (isAnimating) return;
    setIsAnimating(true);
    onMatch(event);
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleSwipeLeft = (event: VolunteerEvent) => {
    if (isAnimating) return;
    setIsAnimating(true);
    onSkip(event);
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleButtonClick = (action: 'like' | 'skip') => {
    if (!currentEvent || isAnimating) return;
    
    if (action === 'like') {
      handleSwipeRight(currentEvent);
    } else {
      handleSwipeLeft(currentEvent);
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0 && !isAnimating) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (currentIndex >= events.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="bg-gradient-to-br from-electric-blue to-electric-red rounded-full p-6 mb-6">
          <Sparkles className="h-12 w-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          You've seen all opportunities!
        </h2>
        <p className="text-gray-600 mb-6">
          Check back later for new volunteer opportunities in your area.
        </p>
        <button
          onClick={() => setCurrentIndex(0)}
          className="bg-electric-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-electric-blue-dark transition-colors"
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900">
            Discover Opportunities
          </h1>
          <span className="bg-electric-blue text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentIndex + 1} of {events.length}
          </span>
        </div>
        
        {user?.preferences.location && (
          <div className="text-sm text-gray-600">
            📍 {user.preferences.location}
          </div>
        )}
      </div>

      {/* Card Stack */}
      <div className="flex-1 relative p-4">
        <div className="relative h-full max-w-md mx-auto">
          {/* Next card (background) */}
          {nextEvent && (
            <SwipeableCard
              key={`${nextEvent.id}-next`}
              event={nextEvent}
              onSwipeRight={handleSwipeRight}
              onSwipeLeft={handleSwipeLeft}
              isTop={false}
            />
          )}
          
          {/* Current card (top) */}
          {currentEvent && (
            <SwipeableCard
              key={`${currentEvent.id}-current`}
              event={currentEvent}
              onSwipeRight={handleSwipeRight}
              onSwipeLeft={handleSwipeLeft}
              isTop={true}
              onCardClick={onCardClick}
            />
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white border-t border-gray-200 p-6">
        <div className="flex justify-center items-center space-x-6 max-w-md mx-auto">
          {/* Skip Button */}
          <button
            onClick={() => handleButtonClick('skip')}
            disabled={!currentEvent || isAnimating}
            className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed w-16 h-16 rounded-full flex items-center justify-center transition-colors shadow-lg"
          >
            <X className="h-8 w-8 text-gray-600" />
          </button>

          {/* Undo Button */}
          <button
            onClick={handleUndo}
            disabled={currentIndex === 0 || isAnimating}
            className="bg-yellow-100 hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed w-12 h-12 rounded-full flex items-center justify-center transition-colors"
          >
            <RotateCcw className="h-5 w-5 text-yellow-600" />
          </button>

          {/* Like Button */}
          <button
            onClick={() => handleButtonClick('like')}
            disabled={!currentEvent || isAnimating}
            className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed w-16 h-16 rounded-full flex items-center justify-center transition-colors shadow-lg"
          >
            <Check className="h-8 w-8 text-white" />
          </button>
        </div>

        <div className="text-center mt-4 space-y-1">
          <p className="text-sm text-gray-600">
            Swipe right or tap ✅ to say "I'm in!"
          </p>
          <p className="text-xs text-gray-500">
            Swipe left or tap ❌ to skip
          </p>
        </div>
      </div>
    </div>
  );
};

export default SwipeInterface;