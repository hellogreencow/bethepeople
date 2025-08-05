import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { mockEvents } from '../data/mockData';
import Navigation from './Navigation';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Mail, 
  Phone, 
  ArrowLeft, 
  Heart,
  CheckCircle,
  XCircle,
  User,
  Globe,
  Home
} from 'lucide-react';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, addRSVP, removeRSVP } = useUser();

  const event = mockEvents.find(e => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h1>
            <button
              onClick={() => navigate('/feed')}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Back to opportunities
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isRSVPed = user?.rsvpedEvents.includes(event.id) || false;

  const handleRSVP = () => {
    if (!user) {
      navigate('/onboarding');
      return;
    }

    if (isRSVPed) {
      removeRSVP(event.id);
    } else {
      addRSVP(event.id);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'virtual': return <Globe className="h-5 w-5" />;
      case 'hybrid': return <Globe className="h-5 w-5" />;
      default: return <Home className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative z-0">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 relative z-10" style={{ paddingTop: 'max(2rem, env(safe-area-inset-top) + 5rem)' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/feed')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to opportunities
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                    event.type === 'virtual' ? 'bg-blue-100 text-blue-800' :
                    event.type === 'hybrid' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {getTypeIcon(event.type)}
                    {event.type}
                  </span>
                  {event.familyFriendly && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      Family Friendly
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                    <p className="text-xl text-green-600 font-semibold">{event.organization}</p>
                  </div>
                  <Heart className="h-6 w-6 text-gray-400 hover:text-red-500 transition-colors cursor-pointer" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">{event.date}</p>
                      <p className="text-sm">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">Commitment</p>
                      <p className="text-sm">{event.commitment}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">Availability</p>
                      <p className="text-sm">{event.spotsAvailable} of {event.totalSpots} spots left</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About this opportunity</h3>
                  <p className="text-gray-700 leading-relaxed">{event.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">What you'll need</h4>
                    <ul className="space-y-2">
                      {event.requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">What you'll gain</h4>
                    <ul className="space-y-2">
                      {event.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <Heart className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {event.skillsNeeded.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Skills needed</h4>
                    <div className="flex flex-wrap gap-2">
                      {event.skillsNeeded.map((skill, index) => (
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
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* RSVP Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {event.spotsAvailable > 0 ? 'Join us!' : 'Full'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.frequency === 'one-time' ? 'bg-blue-100 text-blue-800' :
                    event.frequency === 'weekly' ? 'bg-green-100 text-green-800' :
                    event.frequency === 'monthly' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.frequency}
                  </span>
                </div>
                
                {event.spotsAvailable > 0 ? (
                  <p className="text-gray-600">
                    {event.spotsAvailable} {event.spotsAvailable === 1 ? 'spot' : 'spots'} remaining
                  </p>
                ) : (
                  <p className="text-red-600">This opportunity is currently full</p>
                )}
              </div>

              {event.spotsAvailable > 0 && (
                <button
                  onClick={handleRSVP}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    isRSVPed
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isRSVPed ? (
                    <>
                      <XCircle className="h-5 w-5" />
                      Cancel RSVP
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      RSVP Now
                    </>
                  )}
                </button>
              )}

              {isRSVPed && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center text-green-800">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">You're signed up!</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    We'll send you a reminder closer to the date.
                  </p>
                </div>
              )}
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Organizer</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">{event.contact.name}</span>
                </div>
                
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <a
                    href={`mailto:${event.contact.email}`}
                    className="text-green-600 hover:text-green-700 transition-colors"
                  >
                    {event.contact.email}
                  </a>
                </div>
                
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <a
                    href={`tel:${event.contact.phone}`}
                    className="text-green-600 hover:text-green-700 transition-colors"
                  >
                    {event.contact.phone}
                  </a>
                </div>
              </div>

              <button className="w-full mt-4 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Send Message
              </button>
            </div>

            {/* Organization Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">About {event.organization}</h3>
              <p className="text-gray-600 text-sm mb-4">
                Learn more about this organization and their mission to make a positive impact in the community.
              </p>
              <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                View Organization Profile →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;