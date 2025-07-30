import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserPreferences {
  interests: string[];
  contributionType: string[];
  availability: string;
  location: string;
}

interface UserData {
  name: string;
  preferences: UserPreferences;
  coordinates?: { lat: number; lng: number };
  volunteerHours: number;
  eventsAttended: number;
  badges: string[];
  rsvpedEvents: string[];
}

interface UserContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  updatePreferences: (preferences: UserPreferences) => void;
  addRSVP: (eventId: string) => void;
  removeRSVP: (eventId: string) => void;
  setDemoUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);

  const updatePreferences = (preferences: UserPreferences) => {
    if (user) {
      setUser({ ...user, preferences });
    }
  };

  const addRSVP = (eventId: string) => {
    if (user) {
      setUser({
        ...user,
        rsvpedEvents: [...user.rsvpedEvents, eventId]
      });
    }
  };

  const removeRSVP = (eventId: string) => {
    if (user) {
      setUser({
        ...user,
        rsvpedEvents: user.rsvpedEvents.filter(id => id !== eventId)
      });
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
      volunteerHours: 24,
      eventsAttended: 8,
      badges: ['Community Helper', 'Animal Friend'],
      rsvpedEvents: ['1', '4']
    };
    setUser(demoUser);
  };

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      updatePreferences,
      addRSVP,
      removeRSVP,
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