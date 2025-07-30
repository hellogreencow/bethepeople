import React, { useState, useRef } from 'react';
import { Check, X, MapPin, Clock, Users, Calendar } from 'lucide-react';
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
  const cardRef = useRef<HTMLDivElement>(null);

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
        onSwipeRight(event);
      } else {
        onSwipeLeft(event);
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
        onSwipeRight(event);
      } else {
        onSwipeLeft(event);
      }
    }
    
    setDragOffset({ x: 0, y: 0 });
  };

  const rotation = dragOffset.x * 0.1;
  const opacity = Math.max(0.7, 1 - Math.abs(dragOffset.x) / 300);

  const cardStyle = {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
    opacity: isTop ? opacity : 1,
    zIndex: isTop ? 10 : 1,
    cursor: isTop ? (isDragging ? 'grabbing' : 'grab') : 'default'
  };

  const getSwipeIndicator = () => {
    if (!isDragging || Math.abs(dragOffset.x) < 50) return null;
    
    if (dragOffset.x > 0) {
      return (
        <div className="absolute top-8 left-8 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-lg transform rotate-12 shadow-lg">
          I'M IN!
        </div>
      );
    } else {
      return (
        <div className="absolute top-8 right-8 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg transform -rotate-12 shadow-lg">
          SKIP
        </div>
      );
    }
  };

  return (
    <div
      ref={cardRef}
      className={`absolute inset-0 bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden transition-all duration-200 ${
        !isTop ? 'scale-95' : ''
      }`}
      style={cardStyle}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => onCardClick && onCardClick(event)}
    >
      {getSwipeIndicator()}
      
      {/* Image */}
      <div className="relative h-64">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
            event.type === 'virtual' ? 'bg-blue-500' :
            event.type === 'hybrid' ? 'bg-purple-500' :
            'bg-green-500'
          }`}>
            {event.type}
          </span>
          {event.familyFriendly && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-500 text-white">
              Family Friendly
            </span>
          )}
        </div>
        {(event as any).distance && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium">
            {(event as any).distance.toFixed(1)} mi
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h2>
          <p className="text-lg text-electric-blue font-semibold">{event.organization}</p>
        </div>

        <p className="text-gray-700 mb-4 line-clamp-3">{event.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="text-sm">{event.date}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-sm">{event.time}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm truncate">{event.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span className="text-sm">{event.spotsAvailable} spots left</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {event.skillsNeeded.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            event.frequency === 'one-time' ? 'bg-blue-100 text-blue-800' :
            event.frequency === 'weekly' ? 'bg-green-100 text-green-800' :
            event.frequency === 'monthly' ? 'bg-purple-100 text-purple-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {event.frequency}
          </span>
          <span className="text-sm text-gray-500">{event.commitment}</span>
        </div>
      </div>
    </div>
  );
};

export default SwipeableCard;