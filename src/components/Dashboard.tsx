import React from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import { 
  Calendar, 
  Clock, 
  Award, 
  TrendingUp, 
  Heart, 
  Users, 
  MapPin,
  Star,
  Target,
  Gift
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  if (!user) {
    navigate('/onboarding');
    return null;
  }

  // Mock data for demonstration
  const stats = {
    totalHours: 24,
    eventsAttended: 8,
    causesSupported: 3,
    impactScore: 85
  };

  const recentActivities = [
    {
      id: '1',
      title: 'Community Garden Cleanup',
      organization: 'Green Earth Initiative',
      date: '2025-01-12',
      hours: 3,
      status: 'completed'
    },
    {
      id: '2',
      title: 'Reading Buddy Program',
      organization: 'Literacy First',
      date: '2025-01-15',
      hours: 2,
      status: 'upcoming'
    },
    {
      id: '4',
      title: 'Animal Shelter Dog Walking',
      organization: 'Happy Tails Rescue',
      date: '2025-01-18',
      hours: 2,
      status: 'upcoming'
    }
  ];

  const badges = [
    { name: 'Community Helper', icon: '🏘️', description: 'Volunteered in 3+ different areas' },
    { name: 'Consistent Contributor', icon: '⭐', description: 'Volunteered for 3 months straight' },
    { name: 'Animal Friend', icon: '🐕', description: 'Completed 5+ animal-related activities' }
  ];

  const impactData = [
    { cause: 'Environment', hours: 12, percentage: 50 },
    { cause: 'Education', hours: 8, percentage: 33 },
    { cause: 'Animals', hours: 4, percentage: 17 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">
            Here's your volunteer impact and upcoming opportunities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.totalHours}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Volunteer Hours</h3>
            <p className="text-gray-600 text-sm">Total time contributed</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.eventsAttended}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Events Attended</h3>
            <p className="text-gray-600 text-sm">Opportunities completed</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 rounded-full p-3">
                <Heart className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.causesSupported}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Causes Supported</h3>
            <p className="text-gray-600 text-sm">Different impact areas</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.impactScore}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Impact Score</h3>
            <p className="text-gray-600 text-sm">Community contribution</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
                <button
                  onClick={() => navigate('/feed')}
                  className="text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  Find More →
                </button>
              </div>

              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        activity.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                        <p className="text-gray-600 text-sm">{activity.organization}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{activity.date}</p>
                      <p className="text-gray-600 text-sm">{activity.hours} hours</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Impact Breakdown</h2>
              
              <div className="space-y-4">
                {impactData.map((item) => (
                  <div key={item.cause}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{item.cause}</span>
                      <span className="text-gray-600">{item.hours} hours</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Badges</h2>
              
              <div className="space-y-4">
                {badges.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{badge.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                      <p className="text-gray-600 text-sm">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                View All Badges
              </button>
            </div>

            {/* Monthly Goal */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Goal</h2>
              
              <div className="text-center mb-4">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-green-600"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="75, 100"
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">75%</span>
                  </div>
                </div>
                <p className="text-gray-600">15 of 20 hours completed</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center text-green-800">
                  <Star className="h-5 w-5 mr-2" />
                  <span className="font-medium">Almost there!</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Just 5 more hours to reach your monthly goal.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/feed')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Heart className="h-5 w-5" />
                  Find Opportunities
                </button>
                
                <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Users className="h-5 w-5" />
                  Invite Friends
                </button>
                
                <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Gift className="h-5 w-5" />
                  Share Impact
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;