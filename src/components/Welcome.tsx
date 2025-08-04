import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Award, ArrowRight, Heart, Star, CheckCircle, Globe, Zap, Shield } from 'lucide-react';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { setDemoUser } = useUser();

  const handleDemoLogin = () => {
    setDemoUser();
    navigate('/feed');
  };

  const stats = [
    {
      icon: Users,
      value: 25000,
      title: "Active Volunteers",
      change: 23,
      description: "Making a difference daily"
    },
    {
      icon: Globe,
      value: 1200,
      title: "Communities Served",
      change: 18,
      description: "Across all regions"
    },
    {
      icon: Award,
      value: 8500,
      title: "Projects Completed", 
      change: 31,
      description: "Successful initiatives"
    },
    {
      icon: TrendingUp,
      value: 45,
      title: "Countries Active",
      change: 12,
      description: "Global reach"
    }
  ];

  const features = [
    {
      icon: Zap,
      title: "Instant Impact",
      description: "Connect with causes and see immediate results from your volunteer efforts."
    },
    {
      icon: Shield,
      title: "Verified Organizations",
      description: "All partner organizations are thoroughly vetted for legitimacy and impact."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join a network of passionate volunteers working towards common goals."
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-24 text-center">
        {/* Header Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center bg-white/10 text-white border border-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
            <Star className="w-4 h-4 mr-2 text-yellow-400" />
            <span className="text-sm font-medium">Empowering Communities Worldwide</span>
          </div>
        </motion.div>

        {/* Logo and Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 max-w-4xl"
        >
          <img 
            src="/bethepeople.png" 
            alt="Be The People" 
            className="h-24 w-auto mx-auto mb-6"
          />
          <h2 className="text-xl md:text-2xl lg:text-3xl font-medium text-white/80 mb-6">
            Where Volunteers Unite for Change
          </h2>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Join thousands of passionate volunteers making a real difference in communities worldwide. 
            Connect, contribute, and create lasting impact together.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <button
            onClick={() => navigate('/onboarding')}
            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 inline-flex items-center justify-center gap-2"
          >
            <span className="relative z-10">Start Volunteering</span>
            <ArrowRight className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={handleDemoLogin}
            className="border border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl text-lg backdrop-blur-sm font-semibold inline-flex items-center justify-center gap-2 transition-all duration-300"
          >
            <Heart className="h-5 w-5" />
            Try Demo Account
          </button>
        </motion.div>

        {/* Statistics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-6xl w-full"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/[0.08] border border-white/[0.15] backdrop-blur-xl hover:bg-white/[0.12] transition-all duration-300 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="h-8 w-8 text-blue-400" />
                <span className="text-xs bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-1 rounded-full">
                  +{stat.change}%
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">
                  {stat.value.toLocaleString()}
                </h3>
                <p className="text-sm font-medium text-blue-300">{stat.title}</p>
                <p className="text-xs text-white/60">{stat.description}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-4xl w-full"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">
            Why Choose Be The People?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/[0.08] border border-white/[0.15] backdrop-blur-xl rounded-xl p-6 hover:bg-white/[0.12] transition-all duration-300"
              >
                <feature.icon className="h-8 w-8 text-blue-400 mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                <p className="text-white/70 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-16 text-center"
        >
          <p className="text-white/60 mb-4">Ready to make a difference?</p>
          <div className="flex items-center justify-center gap-2 text-sm text-white/50">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span>Free to join</span>
            <span>•</span>
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span>Verified opportunities</span>
            <span>•</span>
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span>Global community</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;