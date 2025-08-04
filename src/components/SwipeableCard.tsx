import React, { useState, useRef, useEffect } from 'react';
import { Check, X, MapPin, Clock, Users, Calendar, Heart, Zap, Star } from 'lucide-react';
import { VolunteerEvent } from '../data/mockData';

interface SwipeableCardProps {
  event: VolunteerEvent;
  onSwipeRight: (event: VolunteerEvent) => void;
  onSwipeLeft: (event: VolunteerEvent) => void;
  isTop: boolean;
  onCardClick?: (event: VolunteerEvent) => void;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  event,
  onSwipeRight,
  onSwipeLeft,
  isTop,
  onCardClick
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [showParticles, setShowParticles] = useState(false);
  const [particleType, setParticleType] = useState<'like' | 'skip' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Add vibration and particle effects on swipe
  const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const triggerParticles = (type: 'like' | 'skip') => {
    setParticleType(type);
    setShowParticles(true);
    triggerHapticFeedback();
    setTimeout(() => setShowParticles(false), 800);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isTop) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isTop) return;
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (!isDragging || !isTop) return;
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0) {
        triggerParticles('like');
        setTimeout(() => onSwipeRight(event), 200);
      } else {
        triggerParticles('skip');
        setTimeout(() => onSwipeLeft(event), 200);
      }
    }
    
    setDragOffset({ x: 0, y: 0 });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTop) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setStartPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isTop) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isDragging || !isTop) return;
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0) {
        triggerParticles('like');
        setTimeout(() => onSwipeRight(event), 200);
      } else {
        triggerParticles('skip');
        setTimeout(() => onSwipeLeft(event), 200);
      }
    }
    
    setDragOffset({ x: 0, y: 0 });
  };

  const rotation = dragOffset.x * 0.1;
  const opacity = Math.max(0.7, 1 - Math.abs(dragOffset.x) / 300);
  const scale = isTop ? 1 - Math.abs(dragOffset.x) / 2000 : 0.95;

  // Enhanced card styling with gradients and glow effects
  const cardStyle = {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg) scale(${scale})`,
    opacity: isTop ? opacity : 1,
    zIndex: isTop ? 10 : 1,
    cursor: isTop ? (isDragging ? 'grabbing' : 'grab') : 'default',
    filter: isDragging && isTop ? `drop-shadow(0 20px 40px rgba(0,0,0,0.3))` : '',
    transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
  };

  const getSwipeIndicator = () => {
    if (!isDragging || Math.abs(dragOffset.x) < 50) return null;
    
    if (dragOffset.x > 0) {
      return (
        <div className="absolute top-8 left-8 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-full font-bold text-xl transform rotate-12 shadow-2xl animate-pulse border-2 border-white">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 fill-current" />
            YES!
          </div>
        </div>
      );
    } else {
      return (
        <div className="absolute top-8 right-8 bg-gradient-to-r from-red-400 to-pink-500 text-white px-6 py-3 rounded-full font-bold text-xl transform -rotate-12 shadow-2xl animate-pulse border-2 border-white">
          <div className="flex items-center gap-2">
            <X className="h-6 w-6" />
            NOPE
          </div>
        </div>
      );
    }
  };

  // Particle effect component
  const ParticleEffect = () => {
    if (!showParticles) return null;

    const particles = Array.from({ length: 12 }, (_, i) => (
      <div
        key={i}
        className={`absolute w-3 h-3 rounded-full animate-ping ${
          particleType === 'like' 
            ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
            : 'bg-gradient-to-r from-red-400 to-pink-500'
        }`}
        style={{
          left: `${50 + (Math.random() - 0.5) * 60}%`,
          top: `${50 + (Math.random() - 0.5) * 60}%`,
          animationDelay: `${i * 100}ms`,
          animationDuration: '800ms'
        }}
      />
    ));

    return (
      <div className="absolute inset-0 pointer-events-none z-20">
        {particles}
      </div>
    );
  };

  return (
    <div
      ref={cardRef}
      className={`absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50 rounded-3xl overflow-hidden transition-all duration-300 ${
        isTop 
          ? 'shadow-2xl border-2 border-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-[2px]' 
          : 'shadow-lg scale-95 border border-gray-200'
      }`}
      style={cardStyle}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => !isDragging && onCardClick && onCardClick(event)}
    >
      {/* Inner card content */}
      <div className="h-full bg-white rounded-3xl overflow-hidden relative">
        <ParticleEffect />
      {getSwipeIndicator()}
      
        {/* Enhanced Image Section */}
        <div className="relative h-64 overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          draggable={false}
        />
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
          
          {/* Enhanced badges */}
        <div className="absolute top-4 left-4 flex gap-2">
            <span className={`px-4 py-2 rounded-full text-sm font-bold text-white backdrop-blur-sm shadow-lg ${
              event.type === 'virtual' ? 'bg-blue-500/90' :
              event.type === 'hybrid' ? 'bg-purple-500/90' :
              'bg-green-500/90'
          }`}>
              {event.type === 'virtual' ? '💻 Virtual' : 
               event.type === 'hybrid' ? '🌐 Hybrid' : 
               '📍 In-Person'}
            </span>
            {event.familyFriendly && (
              <span className="px-4 py-2 rounded-full text-sm font-bold bg-orange-500/90 text-white backdrop-blur-sm shadow-lg">
                👨‍👩‍👧‍👦 Family
              </span>
            )}
          </div>
          
          {/* Distance badge with glow effect */}
          {(event as any).distance && (
            <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm shadow-lg border border-white/20">
              📍 {(event as any).distance.toFixed(1)} mi
            </div>
          )}

          {/* Match percentage indicator */}
          <div className="absolute bottom-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-lg">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              {Math.floor((event.id.charCodeAt(0) + event.id.charCodeAt(1)) % 30) + 70}% Match
            </div>
          </div>
        </div>

        {/* Enhanced Content Section */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
              {event.title}
            </h2>
            <p className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {event.organization}
            </p>
          </div>

          <p className="text-gray-700 line-clamp-3 leading-relaxed">
            {event.description}
          </p>

          {/* Enhanced info grid with icons */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              <span className="text-sm font-medium">{event.date}</span>
            </div>
            <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
              <Clock className="h-4 w-4 mr-2 text-green-500" />
              <span className="text-sm font-medium">{event.time}</span>
            </div>
            <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
              <MapPin className="h-4 w-4 mr-2 text-red-500" />
              <span className="text-sm font-medium truncate">{event.location}</span>
          </div>
            <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
              <Users className="h-4 w-4 mr-2 text-purple-500" />
              <span className="text-sm font-medium">{event.spotsAvailable} spots</span>
          </div>
        </div>

          {/* Enhanced skills with better styling */}
          <div className="flex flex-wrap gap-2">
          {event.skillsNeeded.slice(0, 3).map((skill, index) => (
            <span
              key={index}
                className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200"
            >
              {skill}
            </span>
          ))}
        </div>

          {/* Enhanced bottom section */}
          <div className="flex justify-between items-center pt-2">
            <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
              event.frequency === 'one-time' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300' :
              event.frequency === 'weekly' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' :
              event.frequency === 'monthly' ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300' :
              'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
          }`}>
            {event.frequency}
          </span>
            <div className="flex items-center gap-1 text-sm text-gray-500 font-medium">
              <Zap className="h-4 w-4 text-yellow-500" />
              {event.commitment}
            </div>
          </div>

          {/* Impact meter */}
          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Impact Potential</span>
              <span className="text-sm font-bold text-green-600">High</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.floor((event.title.charCodeAt(0) + event.title.charCodeAt(1)) % 30) + 70}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwipeableCard;