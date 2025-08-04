import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';
import Navigation from './Navigation';
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Trophy, 
  Flame, 
  Heart, 
  Star,
  TrendingUp,
  Award,
  Users,
  ArrowRight,
  Activity,
  Target,
  Zap,
  CheckCircle
} from 'lucide-react';

interface DashboardProps {
  onOpenAIChat: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onOpenAIChat }) => {
  const navigate = useNavigate();
  const { user } = useUser();

  // Wait for user context to load
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Mock upcoming events
  const upcomingEvents = [
    {
      id: '1',
      title: 'Community Garden Project',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: '9:00 AM',
      location: 'Downtown Community Center',
      participants: 15
    },
    {
      id: '2',
      title: 'Food Bank Distribution',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: '2:00 PM',
      location: 'Central Food Bank',
      participants: 25
    }
  ];

  // Recent activity
  const recentActivity = [
    { type: 'event', action: 'Attended Beach Cleanup', time: '2 days ago', icon: CheckCircle, color: 'text-green-400' },
    { type: 'achievement', action: 'Earned "Week Warrior" badge', time: '1 week ago', icon: Trophy, color: 'text-yellow-400' },
    { type: 'milestone', action: 'Reached 50 volunteer hours', time: '2 weeks ago', icon: Star, color: 'text-purple-400' },
    { type: 'event', action: 'RSVP\'d to Food Bank Distribution', time: '3 weeks ago', icon: Calendar, color: 'text-blue-400' }
  ];

  const statCards = [
    {
      title: 'Current Streak',
      value: user.stats.streak,
      suffix: ' days',
      icon: Flame,
      color: 'from-orange-500 to-red-600',
      change: '+2'
    },
    {
      title: 'Total Points',
      value: user.stats.points,
      icon: Star,
      color: 'from-blue-600 to-purple-600',
      change: '+50'
    },
    {
      title: 'Volunteer Hours',
      value: user.stats.volunteerHours,
      suffix: ' hrs',
      icon: Clock,
      color: 'from-green-500 to-teal-600',
      change: '+5'
    },
    {
      title: 'Impact Score',
      value: user.stats.impactScore,
      suffix: '%',
      icon: Target,
      color: 'from-purple-600 to-pink-600',
      change: '+8'
    }
  ];

  const unlockedAchievements = user.achievements.filter(a => a.unlockedAt);
  const progressAchievements = user.achievements.filter(a => !a.unlockedAt && a.progress && a.progress > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10">
        <Navigation onOpenAIChat={onOpenAIChat} />
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >

          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user.name}!</h1>
          <p className="text-white/70 text-lg">Here's your volunteer impact summary</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
                              className={`relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl bg-white/20 border border-white/20 hover:scale-105 transition-all duration-300`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-20`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                  <span className="text-xs bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-white/70 text-sm font-medium mb-1">{stat.title}</h3>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-white">
                    {stat.value}
                  </span>
                  <span className="text-lg text-white/70 ml-1">{stat.suffix}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
                <button
                  onClick={() => navigate('/feed')}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm font-medium"
                >
                  View all
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <h3 className="text-white font-semibold mb-2">{event.title}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {event.date.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {event.participants} volunteers
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`p-2 rounded-full bg-white/10 ${activity.color}`}>
                      <activity.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{activity.action}</p>
                      <p className="text-white/50 text-sm">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{user.name}</h3>
                  <p className="text-white/70">Level {user.stats.level} Volunteer</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Member since</span>
                  <span className="text-white font-medium">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Location</span>
                  <span className="text-white font-medium">{user.preferences.location}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Events attended</span>
                  <span className="text-white font-medium">{user.stats.eventsAttended}</span>
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">Achievements</h2>
              
              {unlockedAchievements.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm text-white/70 mb-2">Unlocked</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {unlockedAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="text-center"
                        title={achievement.title}
                      >
                        <div className="text-2xl mb-1">{achievement.icon}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {progressAchievements.length > 0 && (
                <div>
                  <h3 className="text-sm text-white/70 mb-2">In Progress</h3>
                  <div className="space-y-3">
                    {progressAchievements.slice(0, 3).map((achievement) => (
                      <div key={achievement.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white">{achievement.title}</span>
                          <span className="text-xs text-white/50">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-full rounded-full"
                            style={{ 
                              width: `${(achievement.progress! / achievement.maxProgress!) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;