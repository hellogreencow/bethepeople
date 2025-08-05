import React, { useState, useEffect, useRef } from 'react';
import { Check, X, RotateCcw, Sparkles, Heart, Star } from 'lucide-react';
import { VolunteerEvent } from '../data/mockData';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileSwipeInterfaceProps {
  events: VolunteerEvent[];
  onMatch: (event: VolunteerEvent) => void;
  onSkip: (event: VolunteerEvent) => void;
  onCardClick?: (event: VolunteerEvent) => void;
}

const MobileSwipeInterface: React.FC<MobileSwipeInterfaceProps> = ({
  events,
  onMatch,
  onSkip,
  onCardClick
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const { user } = useUser();
  const cardRef = useRef<HTMLDivElement>(null);

  const currentEvent = events[currentIndex];
  const nextEvent = events[currentIndex + 1];

  // Enhanced mobile touch handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!currentEvent || isAnimating) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setStartPos({ x: touch.clientX, y: touch.clientY });
    
    // Add haptic feedback on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !currentEvent || isAnimating) return;
    e.preventDefault(); // Prevent scrolling
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;
    
    // Only allow horizontal swiping
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setDragOffset({ x: deltaX, y: deltaY * 0.3 });
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || !currentEvent || isAnimating) return;
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      setIsAnimating(true);
      
      // Stronger haptic feedback for action
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50]);
      }
      
      if (dragOffset.x > 0) {
        onMatch(currentEvent);
      } else {
        onSkip(currentEvent);
      }
      
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    }
    
    setDragOffset({ x: 0, y: 0 });
  };

  const handleButtonClick = (action: 'like' | 'skip') => {
    if (!currentEvent || isAnimating) return;
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
    
    setIsAnimating(true);
    
    if (action === 'like') {
      onMatch(currentEvent);
    } else {
      onSkip(currentEvent);
    }
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleUndo = () => {
    if (currentIndex > 0 && !isAnimating) {
      setCurrentIndex(prev => prev - 1);
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    }
  };

  if (currentIndex >= events.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-full p-8 mb-6"
        >
          <Sparkles className="h-16 w-16 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-4">
          All done! 🎉
        </h2>
        <p className="text-white/70 mb-8 text-lg">
          You've seen all opportunities! Check back later for more.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentIndex(0)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
        >
          Start Over
        </motion.button>
      </div>
    );
  }

  const rotation = dragOffset.x * 0.1;
  const opacity = Math.max(0.7, 1 - Math.abs(dragOffset.x) / 300);
  const scale = 1 - Math.abs(dragOffset.x) / 2000;

  const getSwipeIndicator = () => {
    if (!isDragging || Math.abs(dragOffset.x) < 60) return null;
    
    if (dragOffset.x > 0) {
      return (
        <div className="absolute top-8 left-8 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-full font-bold text-xl transform rotate-12 shadow-2xl animate-pulse border-2 border-white z-20">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 fill-current" />
            <span className="text-lg">YES!</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="absolute top-8 right-8 bg-gradient-to-r from-red-400 to-pink-500 text-white px-6 py-3 rounded-full font-bold text-xl transform -rotate-12 shadow-2xl animate-pulse border-2 border-white z-20">
          <div className="flex items-center gap-2">
            <X className="h-6 w-6" />
            <span className="text-lg">NOPE</span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Card Stack */}
      <div className="flex-1 relative px-4 overflow-hidden mt-2">
        <div className="relative h-full">
          {/* Next card (background) */}
          {nextEvent && (
            <div className="absolute inset-0 scale-95 opacity-60 rounded-3xl">
              <MobileCard event={nextEvent} />
            </div>
          )}
          
          {/* Current card (top) */}
          {currentEvent && (
            <div
              ref={cardRef}
              className="absolute inset-0 cursor-grab active:cursor-grabbing touch-pan-y"
              style={{
                transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg) scale(${scale})`,
                opacity,
                transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => !isDragging && onCardClick && onCardClick(currentEvent)}
            >
              {getSwipeIndicator()}
              <MobileCard event={currentEvent} showTitle={true} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Action Buttons - Larger for touch */}
      <div className="bg-white/10 backdrop-blur-xl border-t border-white/20 p-4 pb-safe rounded-t-2xl mt-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="flex justify-center items-center space-x-8">
          {/* Skip Button - Larger */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleButtonClick('skip')}
            disabled={!currentEvent || isAnimating}
            className="bg-white/10 backdrop-blur-xl hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed w-20 h-20 rounded-full flex items-center justify-center transition-all border border-white/20 shadow-lg"
          >
            <X className="h-10 w-10 text-red-400" />
          </motion.button>

          {/* Undo Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleUndo}
            disabled={currentIndex === 0 || isAnimating}
            className="bg-white/10 backdrop-blur-xl hover:bg-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed w-16 h-16 rounded-full flex items-center justify-center transition-all border border-white/20"
          >
            <RotateCcw className="h-6 w-6 text-yellow-400" />
          </motion.button>

          {/* Like Button - Larger */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleButtonClick('like')}
            disabled={!currentEvent || isAnimating}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg"
          >
            <Check className="h-10 w-10 text-white" />
          </motion.button>
        </div>

        {/* Mobile Instructions */}
        <div className="text-center mt-4 space-y-1">
          <p className="text-sm text-white/70 font-medium">
            Swipe right to match • Swipe left to pass
          </p>
          <p className="text-xs text-white/50">
            Tap a card to see more details
          </p>
        </div>
      </div>
    </div>
  );
};

// Mobile-optimized card component
const MobileCard: React.FC<{ event: VolunteerEvent; showTitle?: boolean }> = ({ event, showTitle = false }) => {
  return (
    <div className="h-full bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl overflow-hidden shadow-2xl border-2 border-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-[2px]">
      <div className="h-full bg-white rounded-3xl overflow-hidden relative">
        {/* Card Title - Only show on main card */}
        {showTitle && (
          <div className="absolute top-3 left-3 right-3 z-10">
            <div className="bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
              <h2 className="text-base font-bold text-white leading-tight">
                {event.title}
              </h2>
              <p className="text-xs text-white/80 font-medium">
                {event.organization}
              </p>
            </div>
          </div>
        )}
        
        {/* Mobile Image Section - Larger */}
        <div className="relative h-64 overflow-hidden rounded-t-2xl">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            draggable={false}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
          
          {/* Mobile badges */}
          <div className={`absolute ${showTitle ? 'top-20' : 'top-3'} left-3 flex gap-2`}>
            <span className={`px-2 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm shadow-lg ${
              event.type === 'virtual' ? 'bg-blue-500/90' :
              event.type === 'hybrid' ? 'bg-purple-500/90' :
              'bg-green-500/90'
            }`}>
              {event.type === 'virtual' ? '💻' : 
               event.type === 'hybrid' ? '🌐' : '📍'}
            </span>
            {event.familyFriendly && (
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-500/90 text-white backdrop-blur-sm shadow-lg">
                👨‍👩‍👧‍👦
              </span>
            )}
          </div>
          
          {/* Distance badge */}
          {(event as any).distance && (
            <div className={`absolute ${showTitle ? 'top-20' : 'top-3'} right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-lg`}>
              {(event as any).distance.toFixed(1)} mi
            </div>
          )}

          {/* Match percentage */}
          <div className="absolute bottom-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-xl text-xs font-bold backdrop-blur-sm shadow-lg flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            {Math.floor((event.id.charCodeAt(0) + event.id.charCodeAt(1)) % 30) + 70}%
          </div>
        </div>

        {/* Mobile Content - More compact */}
        <div className="p-4 space-y-3">
          {!showTitle && (
            <div className="space-y-1">
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
                {event.title}
              </h2>
              <p className="text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {event.organization}
              </p>
            </div>
          )}

          <p className="text-gray-700 line-clamp-2 leading-relaxed text-sm">
            {event.description}
          </p>

          {/* Mobile info grid - Simplified */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-lg mr-2">📅</span>
              <div>
                <p className="text-2xs text-gray-500">Date</p>
                <p className="text-xs font-medium">{event.date}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-lg mr-2">👥</span>
              <div>
                <p className="text-2xs text-gray-500">Spots</p>
                <p className="text-xs font-medium">{event.spotsAvailable} left</p>
              </div>
            </div>
          </div>

          {/* Streamlined Mobile Header */}
          {/* Skills and commitment */}
          <div className="flex flex-wrap gap-1">
            {event.skillsNeeded.slice(0, 2).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-xl text-2xs font-medium border border-blue-200"
              >
                {skill}
              </span>
            ))}
          </div>
          
          {/* Bottom row */}
          <div className="flex justify-between items-center">
            <span className={`px-3 py-1 rounded-xl text-2xs font-bold shadow-sm ${
              event.frequency === 'one-time' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300' :
              event.frequency === 'weekly' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' :
              event.frequency === 'monthly' ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300' :
              'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
            }`}>
              {event.frequency}
            </span>
            <div className="flex items-center gap-1 text-2xs text-gray-500 font-medium">
              <span>⚡</span>
              {event.commitment}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSwipeInterface;