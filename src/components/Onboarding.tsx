import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import LocationInput from './LocationInput';
import { ChevronRight, ChevronLeft, MapPin, Clock, Heart, Briefcase } from 'lucide-react';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    interests: [] as string[],
    contributionType: [] as string[],
    availability: '',
    location: '',
    coordinates: undefined as { lat: number; lng: number } | undefined
  });

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canProceed()) {
      if (currentStep === steps.length - 1) {
        handleComplete();
      } else {
        handleNext();
      }
    }
  };

  const interests = [
    'Environment & Nature',
    'Education & Youth',
    'Seniors & Elderly',
    'Animals & Pets',
    'Arts & Culture',
    'Health & Wellness',
    'Food & Hunger',
    'Housing & Homelessness',
    'Technology & Digital',
    'Community Development'
  ];

  const contributionTypes = [
    'In-person volunteering',
    'Virtual/Remote help',
    'Skilled professional work',
    'Event planning & coordination',
    'Teaching & mentoring',
    'Physical labor & cleanup',
    'Fundraising & donations',
    'Administrative support'
  ];

  const availabilityOptions = [
    'Weekends only',
    'Weekday evenings',
    'Flexible schedule',
    'Once a month',
    'Weekly commitment',
    'One-time events only'
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleContributionToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      contributionType: prev.contributionType.includes(type)
        ? prev.contributionType.filter(t => t !== type)
        : [...prev.contributionType, type]
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const userData = {
      name: formData.name,
      preferences: {
        interests: formData.interests,
        contributionType: formData.contributionType,
        availability: formData.availability,
        location: formData.location
      },
      coordinates: formData.coordinates,
      volunteerHours: 0,
      eventsAttended: 0,
      badges: [],
      rsvpedEvents: []
    };
    setUser(userData);
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
      icon: <Heart className="h-6 w-6" />,
      component: (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter your first name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            onKeyDown={handleKeyPress}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      )
    },
    {
      title: "What causes do you care about?",
      icon: <Heart className="h-6 w-6" />,
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {interests.map((interest) => (
            <button
              key={interest}
              onClick={() => handleInterestToggle(interest)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                formData.interests.includes(interest)
                  ? 'border-electric-blue bg-blue-50 text-electric-blue font-bold'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-electric-blue'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "How would you like to contribute?",
      icon: <Briefcase className="h-6 w-6" />,
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contributionTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleContributionToggle(type)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                formData.contributionType.includes(type)
                  ? 'border-electric-red bg-red-50 text-electric-red font-bold'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-electric-red'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "When are you usually free?",
      icon: <Clock className="h-6 w-6" />,
      component: (
        <div className="space-y-3">
          {availabilityOptions.map((option) => (
            <button
              key={option}
              onClick={() => setFormData(prev => ({ ...prev, availability: option }))}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                formData.availability === option
                  ? 'border-electric-blue bg-blue-50 text-electric-blue font-bold'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-electric-blue'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "What city or zip code are you in?",
      icon: <MapPin className="h-6 w-6" />,
      component: (
        <div className="space-y-4">
          <LocationInput
            value={formData.location}
            onChange={(location, coordinates) => 
              setFormData(prev => ({ ...prev, location, coordinates }))
            }
            placeholder="Enter your city or zip code"
          />
          <p className="text-sm text-gray-600 mt-2">
            We'll use this to show you volunteer opportunities in your area. 
            Click the navigation icon to use your current location.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-electric-blue-light via-white to-electric-red-light py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-sm text-gray-600">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-electric-blue h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div 
            className="bg-white rounded-2xl shadow-xl p-8 border-4 border-electric-blue"
            onKeyDown={handleKeyPress}
            tabIndex={0}
          >
            <div className="flex items-center mb-6">
              <div className="bg-electric-red rounded-full p-3 mr-4">
                {steps[currentStep].icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {steps[currentStep].title}
              </h2>
            </div>

            {steps[currentStep].component}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
                  currentStep === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
                Back
              </button>

              {currentStep === steps.length - 1 ? (
                <button
                  onClick={handleComplete}
                  disabled={!canProceed()}
                  className={`px-8 py-3 rounded-lg font-semibold ${
                    canProceed()
                      ? 'bg-electric-red text-white hover:bg-electric-red-dark shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Complete Setup
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
                    canProceed()
                      ? 'bg-electric-blue text-white hover:bg-electric-blue-dark shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
    </div>
  );
};

export default Onboarding;