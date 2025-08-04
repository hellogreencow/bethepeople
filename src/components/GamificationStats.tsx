import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Target, Star, TrendingUp, Award, Zap, Users, Heart } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  maxValue?: number;
  icon: React.ReactNode;
  gradient: string;
  suffix?: string;
  showProgress?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  maxValue,
  icon,
  gradient,
  suffix = "",
  showProgress = false
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);

  const progressPercentage = maxValue ? Math.min((displayValue / maxValue) * 100, 100) : 0;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 backdrop-blur-sm border border-white/10 
        hover:scale-105 transition-all duration-300 cursor-pointer group shadow-xl ${gradient}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 translate-y-12 -translate-x-12" />
      </div>

      <div className="relative z-10">
        {/* Icon */}
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm inline-flex mb-4">
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-white/90 text-sm font-medium mb-2">
          {title}
        </h3>

        {/* Value */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-bold text-white">
              {displayValue.toLocaleString()}
            </span>
            {suffix && (
              <span className="text-lg font-medium text-white/70 ml-1">
                {suffix}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && maxValue && (
          <div className="mt-4">
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-white rounded-full shadow-lg transition-all duration-1500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>0</span>
              <span>{maxValue.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface GamificationStatsProps {
  stats: {
    streak: number;
    points: number;
    matches: number;
    totalSwipes: number;
    level: number;
    volunteerHours: number;
    eventsAttended: number;
    impactScore: number;
  };
}

const GamificationStats: React.FC<GamificationStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: "Day Streak",
      value: stats.streak,
      maxValue: 30,
      icon: <Flame className="w-6 h-6 text-orange-400" />,
      gradient: "bg-gradient-to-br from-orange-500 via-red-600 to-pink-700",
      suffix: "",
      showProgress: true
    },
    {
      title: "Total Points",
      value: stats.points,
      icon: <Star className="w-6 h-6 text-yellow-300" />,
      gradient: "bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800",
    },
    {
      title: "Matches Made",
      value: stats.matches,
      icon: <Heart className="w-6 h-6 text-pink-400" />,
      gradient: "bg-gradient-to-br from-purple-600 via-purple-700 to-pink-700",
    },
    {
      title: "Impact Score",
      value: stats.impactScore,
      maxValue: 100,
      icon: <Users className="w-6 h-6 text-green-400" />,
      gradient: "bg-gradient-to-br from-green-500 via-teal-600 to-blue-700",
      showProgress: true
    }
  ];

  // Achievement badges based on stats
  const achievements = [];
  if (stats.streak >= 7) achievements.push({ icon: <Flame className="w-5 h-5" />, name: "Week Warrior", color: "from-orange-400 to-red-500" });
  if (stats.points >= 100) achievements.push({ icon: <Trophy className="w-5 h-5" />, name: "Century Club", color: "from-yellow-400 to-orange-500" });
  if (stats.eventsAttended >= 5) achievements.push({ icon: <Award className="w-5 h-5" />, name: "Active Volunteer", color: "from-blue-400 to-purple-500" });
  if (stats.level >= 5) achievements.push({ icon: <TrendingUp className="w-5 h-5" />, name: "Rising Star", color: "from-green-400 to-teal-500" });
  if (stats.volunteerHours >= 10) achievements.push({ icon: <Zap className="w-5 h-5" />, name: "Time Giver", color: "from-purple-400 to-pink-500" });

  return (
    <div className="w-full">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Achievement Badges */}
      {achievements.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
            Your Achievements
          </h3>
          <div className="flex justify-center gap-3 flex-wrap">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 px-4 py-2 rounded-full
                  bg-gradient-to-r ${achievement.color}
                  text-white font-medium shadow-lg text-sm
                  hover:scale-105 transition-transform duration-200`}
              >
                {achievement.icon}
                <span>{achievement.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationStats; 