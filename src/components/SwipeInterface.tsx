import React, { useState, useEffect } from 'react';
import { Check, X, RotateCcw, Sparkles } from 'lucide-react';
import SwipeableCard from './SwipeableCard';
import { VolunteerEvent } from '../data/mockData';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';

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
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-full p-6 mb-6"
        >
          <Sparkles className="h-12 w-12 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-4">
          You've seen all opportunities!
        </h2>
        <p className="text-white/70 mb-6">
          Check back later for new volunteer opportunities in your area.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentIndex(0)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          Start Over
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 p-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">
              Discover Opportunities
            </h1>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentIndex + 1} of {events.length}
            </span>
          </div>
          
          {user?.preferences.location && (
            <div className="text-sm text-white/70">
              📍 {user.preferences.location}
            </div>
          )}
        </div>
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
      <div className="bg-white/10 backdrop-blur-xl border-t border-white/20 p-6 rounded-b-2xl">
        <div className="flex justify-center items-center space-x-6 max-w-md mx-auto">
          {/* Skip Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleButtonClick('skip')}
            disabled={!currentEvent || isAnimating}
            className="bg-white/10 backdrop-blur-xl hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed w-16 h-16 rounded-full flex items-center justify-center transition-all border border-white/20"
          >
            <X className="h-8 w-8 text-red-400" />
          </motion.button>

          {/* Undo Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleUndo}
            disabled={currentIndex === 0 || isAnimating}
            className="bg-white/10 backdrop-blur-xl hover:bg-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed w-12 h-12 rounded-full flex items-center justify-center transition-all border border-white/20"
          >
            <RotateCcw className="h-5 w-5 text-yellow-400" />
          </motion.button>

          {/* Like Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleButtonClick('like')}
            disabled={!currentEvent || isAnimating}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg"
          >
            <Check className="h-8 w-8 text-white" />
          </motion.button>
        </div>

        <div className="text-center mt-4 space-y-1">
          <p className="text-sm text-white/70">
            Swipe right or tap ✅ to say "I'm in!"
          </p>
          <p className="text-xs text-white/50">
            Swipe left or tap ❌ to skip
          </p>
        </div>
      </div>
    </div>
  );
};

export default SwipeInterface;