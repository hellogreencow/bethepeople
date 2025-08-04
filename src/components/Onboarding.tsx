import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import LocationInput from './LocationInput';
import { 
  User, 
  Mail, 
  MapPin, 
  Clock, 
  Heart, 
  Users, 
  Calendar,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  MessageSquare,
  Loader2
} from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  interests: string[];
  contributionType: string[];
  availability: string;
  location: string;
  coordinates?: { lat: number; lng: number };
}

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    interests: [],
    contributionType: [],
    availability: '',
    location: ''
  });

  const totalSteps = 5;

  const interestOptions = [
    'Community Building',
    'Environmental Action', 
    'Education & Mentoring',
    'Healthcare Support',
    'Technology for Good',
    'Arts & Culture',
    'Social Justice',
    'Economic Empowerment',
    'Youth Programs',
    'Senior Support',
    'Animal Welfare',
    'Disaster Relief'
  ];

  const contributionTypes = [
    { value: 'volunteer', label: 'Volunteer Time', icon: Heart },
    { value: 'skills', label: 'Professional Skills', icon: Users },
    { value: 'mentor', label: 'Mentorship', icon: MessageSquare },
    { value: 'physical', label: 'Physical Help', icon: Users }
  ];

  const availabilityOptions = [
    'Weekday mornings',
    'Weekday afternoons',
    'Weekday evenings',
    'Weekend mornings',
    'Weekend afternoons',
    'Weekend evenings',
    'Flexible schedule'
  ];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const userData = {
      name: formData.name,
      preferences: {
        interests: formData.interests,
        contributionType: formData.contributionType,
        availability: formData.availability,
        location: formData.location
      },
      coordinates: formData.coordinates,
      stats: {
        streak: 0,
        points: 0,
        matches: 0,
        totalSwipes: 0,
        level: 1,
        volunteerHours: 0,
        eventsAttended: 0,
        impactScore: 0
      },
      badges: [],
      rsvpedEvents: [],
      achievements: [
        {
          id: 'first-step',
          title: 'First Step',
          description: 'Complete your profile',
          icon: '🌟',
          progress: 0,
          maxProgress: 1
        },
        {
          id: 'helping-hand',
          title: 'Helping Hand',
          description: 'Attend your first event',
          icon: '🤝',
          progress: 0,
          maxProgress: 1
        },
        {
          id: 'community-champion',
          title: 'Community Champion',
          description: 'Volunteer for 10 hours',
          icon: '🏆',
          progress: 0,
          maxProgress: 10
        },
        {
          id: 'streak-master',
          title: 'Streak Master',
          description: 'Maintain a 7-day streak',
          icon: '🔥',
          progress: 0,
          maxProgress: 7
        },
        {
          id: 'social-butterfly',
          title: 'Social Butterfly',
          description: 'RSVP to 5 events',
          icon: '🦋',
          progress: 0,
          maxProgress: 5
        }
      ],
      lastActiveDate: new Date()
    };
    
    setUser(userData);
    setIsSubmitting(false);
    navigate('/feed');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.name.trim() !== '';
      case 1: return formData.interests.length > 0;
      case 2: return formData.contributionType.length > 0;
      case 3: return formData.availability !== '';
      case 4: return formData.location.trim() !== '';
      default: return false;
    }
  };

  const steps = [
    {
      title: "What's your name?",
      description: "Let's start with the basics"
    },
    {
      title: "What interests you?",
      description: "Select the causes you're passionate about"
    },
    {
      title: "How would you like to help?",
      description: "Choose your preferred contribution types"
    },
    {
      title: "When are you available?",
      description: "Let us know your schedule"
    },
    {
      title: "Where are you located?",
      description: "Help us find opportunities near you"
    }
  ];

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const toggleContribution = (type: string) => {
    setFormData(prev => ({
      ...prev,
      contributionType: prev.contributionType.includes(type)
        ? prev.contributionType.filter(t => t !== type)
        : [...prev.contributionType, type]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>
      
      <div className="relative z-10 w-full max-w-2xl">
        {/* Glass morphism container */}
                      <div className="relative backdrop-blur-xl bg-white/20 border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white/70 text-sm">Step {currentStep + 1} of {totalSteps}</span>
              <span className="text-white/70 text-sm">{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-white">{steps[currentStep].title}</h2>
                  <p className="text-white/70">{steps[currentStep].description}</p>
                </div>

                {/* Step Content */}
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="grid grid-cols-2 gap-3">
                    {interestOptions.map((interest) => (
                      <motion.button
                        key={interest}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleInterest(interest)}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                          formData.interests.includes(interest)
                            ? 'bg-blue-500/20 border-blue-400 text-white'
                            : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {interest}
                      </motion.button>
                    ))}
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="grid grid-cols-1 gap-4">
                    {contributionTypes.map((type) => (
                      <motion.button
                        key={type.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleContribution(type.value)}
                        className={`p-4 rounded-xl border transition-all ${
                          formData.contributionType.includes(type.value)
                            ? 'bg-purple-500/20 border-purple-400 text-white'
                            : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <type.icon className="w-5 h-5" />
                          <span className="font-medium">{type.label}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="grid grid-cols-1 gap-3">
                    {availabilityOptions.map((option) => (
                      <motion.button
                        key={option}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, availability: option })}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                          formData.availability === option
                            ? 'bg-red-500/20 border-red-400 text-white'
                            : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Clock className="w-4 h-4" />
                          <span>{option}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <LocationInput
                      value={formData.location}
                      onChange={(location, coordinates) => {
                        setFormData({ 
                          ...formData, 
                          location,
                          coordinates
                        });
                      }}
                      placeholder="Enter your city or zip code"
                      className="dark"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                currentStep === 0
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
              Back
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleComplete}
                disabled={!canProceed() || isSubmitting}
                className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                  canProceed() && !isSubmitting
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white hover:shadow-lg'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Profile...</span>
                  </div>
                ) : (
                  'Complete Setup'
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  canProceed()
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white hover:shadow-lg'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;