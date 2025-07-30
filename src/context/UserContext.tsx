import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserPreferences {
  interests: string[];
  contributionType: string[];
  availability: string;
  location: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface UserStats {
  streak: number;
  points: number;
  matches: number;
  totalSwipes: number;
  level: number;
  volunteerHours: number;
  eventsAttended: number;
  impactScore: number;
}

interface UserData {
  name: string;
  preferences: UserPreferences;
  coordinates?: { lat: number; lng: number };
  stats: UserStats;
  badges: string[];
  rsvpedEvents: string[];
  achievements: Achievement[];
  lastActiveDate: Date;
}

interface UserContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  updatePreferences: (preferences: UserPreferences) => void;
  addRSVP: (eventId: string) => void;
  removeRSVP: (eventId: string) => void;
  updateStats: (statUpdates: Partial<UserStats>) => void;
  unlockAchievement: (achievementId: string) => void;
  incrementStreak: () => void;
  setDemoUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Predefined achievements
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-swipe',
    title: 'Getting Started',
    description: 'Made your first swipe!',
    icon: '👋',
    maxProgress: 1
  },
  {
    id: 'swipe-master',
    title: 'Swipe Master',
    description: 'Swiped on 50 opportunities',
    icon: '🚀',
    maxProgress: 50
  },
  {
    id: 'community-champion',
    title: 'Community Champion',
    description: 'Matched with 10 opportunities',
    icon: '🏆',
    maxProgress: 10
  },
  {
    id: 'streak-warrior',
    title: 'Streak Warrior',
    description: 'Maintained a 7-day streak',
    icon: '🔥',
    maxProgress: 7
  },
  {
    id: 'volunteer-hero',
    title: 'Volunteer Hero',
    description: 'RSVP\'d to 5 events',
    icon: '🦸',
    maxProgress: 5
  },
  {
    id: 'impact-maker',
    title: 'Impact Maker',
    description: 'Earned 1000 points',
    icon: '⚡',
    maxProgress: 1000
  },
  {
    id: 'social-butterfly',
    title: 'Social Butterfly',
    description: 'Shared 3 opportunities',
    icon: '🦋',
    maxProgress: 3
  },
  {
    id: 'dedication',
    title: 'Dedication',
    description: 'Used the app for 30 days',
    icon: '💎',
    maxProgress: 30
  }
];

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);

  const updatePreferences = (preferences: UserPreferences) => {
    if (user) {
      setUser({ ...user, preferences });
    }
  };

  const addRSVP = (eventId: string) => {
    if (user) {
      const updatedUser = {
        ...user,
        rsvpedEvents: [...user.rsvpedEvents, eventId],
        stats: {
          ...user.stats,
          points: user.stats.points + 50,
          eventsAttended: user.stats.eventsAttended + 1
        }
      };
      setUser(updatedUser);
      checkAchievements(updatedUser);
    }
  };

  const removeRSVP = (eventId: string) => {
    if (user) {
      setUser({
        ...user,
        rsvpedEvents: user.rsvpedEvents.filter(id => id !== eventId),
        stats: {
          ...user.stats,
          points: Math.max(0, user.stats.points - 50),
          eventsAttended: Math.max(0, user.stats.eventsAttended - 1)
        }
      });
    }
  };

  const updateStats = (statUpdates: Partial<UserStats>) => {
    if (user) {
      const updatedUser = {
        ...user,
        stats: { ...user.stats, ...statUpdates },
        lastActiveDate: new Date()
      };
      
      // Update level based on points
      const newLevel = Math.floor(updatedUser.stats.points / 500) + 1;
      updatedUser.stats.level = newLevel;
      
      setUser(updatedUser);
      checkAchievements(updatedUser);
    }
  };

  const unlockAchievement = (achievementId: string) => {
    if (user) {
      const updatedAchievements = user.achievements.map(achievement =>
        achievement.id === achievementId
          ? { ...achievement, unlockedAt: new Date() }
          : achievement
      );
      
      setUser({
        ...user,
        achievements: updatedAchievements,
        stats: {
          ...user.stats,
          points: user.stats.points + 100 // Bonus points for achievements
        }
      });
    }
  };

  const incrementStreak = () => {
    if (user) {
      const today = new Date();
      const lastActive = user.lastActiveDate;
      const timeDiff = today.getTime() - lastActive.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      let newStreak = user.stats.streak;
      if (daysDiff === 1) {
        // Consecutive day
        newStreak += 1;
      } else if (daysDiff > 1) {
        // Streak broken
        newStreak = 1;
      }
      // If daysDiff === 0, same day, don't change streak
      
      updateStats({ streak: newStreak });
    }
  };

  const checkAchievements = (userData: UserData) => {
    const updatedAchievements = userData.achievements.map(achievement => {
      if (achievement.unlockedAt) return achievement; // Already unlocked
      
      let progress = 0;
      
      switch (achievement.id) {
        case 'first-swipe':
          progress = userData.stats.totalSwipes > 0 ? 1 : 0;
          break;
        case 'swipe-master':
          progress = userData.stats.totalSwipes;
          break;
        case 'community-champion':
          progress = userData.stats.matches;
          break;
        case 'streak-warrior':
          progress = userData.stats.streak;
          break;
        case 'volunteer-hero':
          progress = userData.rsvpedEvents.length;
          break;
        case 'impact-maker':
          progress = userData.stats.points;
          break;
        case 'dedication':
          // Calculate days since first use (simplified)
          progress = Math.floor(Math.random() * 10) + 1; // Placeholder
          break;
        default:
          progress = 0;
      }
      
      const updatedAchievement = { ...achievement, progress };
      
      // Check if achievement should be unlocked
      if (progress >= (achievement.maxProgress || 1) && !achievement.unlockedAt) {
        updatedAchievement.unlockedAt = new Date();
        // Could trigger a notification here
        console.log(`🎉 Achievement unlocked: ${achievement.title}`);
      }
      
      return updatedAchievement;
    });
    
    if (user) {
      setUser({ ...userData, achievements: updatedAchievements });
    }
  };

  const setDemoUser = () => {
    const demoUser: UserData = {
      name: 'Demo User',
      preferences: {
        interests: ['Environment & Nature', 'Education & Youth', 'Animals & Pets'],
        contributionType: ['In-person volunteering', 'Teaching & mentoring'],
        availability: 'Weekends only',
        location: 'Washington, DC'
      },
      coordinates: { lat: 38.9072, lng: -77.0369 }, // Washington, DC coordinates
      stats: {
        streak: 3,
        points: 280,
        matches: 12,
        totalSwipes: 45,
        level: 1,
        volunteerHours: 24,
        eventsAttended: 8,
        impactScore: 87
      },
      badges: ['Community Helper', 'Animal Friend', 'Early Adopter'],
      rsvpedEvents: ['1', '4'],
      achievements: ACHIEVEMENTS.map(achievement => ({
        ...achievement,
        progress: 0
      })),
      lastActiveDate: new Date()
    };
    
    // Pre-unlock some achievements for demo
    demoUser.achievements[0].unlockedAt = new Date(); // First swipe
    demoUser.achievements[0].progress = 1;
    
    setUser(demoUser);
  };

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      updatePreferences,
      addRSVP,
      removeRSVP,
      updateStats,
      unlockAchievement,
      incrementStreak,
      setDemoUser
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};