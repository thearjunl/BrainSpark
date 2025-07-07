import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const LandingPage = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: "🧠",
      title: "AI-Powered Questions",
      description: "Upload PDF notes and let our AI generate intelligent quiz questions automatically."
    },
    {
      icon: "⚡",
      title: "Real-Time Sessions",
      description: "Live quiz sessions with instant feedback and real-time leaderboards."
    },
    {
      icon: "👥",
      title: "Group Management",
      description: "Create classes, invite students, and manage multiple groups effortlessly."
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description: "Track student performance with detailed analytics and insights."
    },
    {
      icon: "🎯",
      title: "Smart Scoring",
      description: "Advanced scoring system with time-based bonuses and accuracy tracking."
    },
    {
      icon: "🔒",
      title: "Secure Platform",
      description: "Enterprise-grade security with role-based access and data protection."
    }
  ];

  const stats = [
    { number: "10K+", label: "Questions Generated" },
    { number: "500+", label: "Active Teachers" },
    { number: "5K+", label: "Students Engaged" },
    { number: "99.9%", label: "Uptime" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold gradient-text">BrainSpark</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link to={user.role === 'teacher' ? '/teacher' : '/student'} className="btn-primary">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-bg hero-pattern relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="hero-title font-bold text-white mb-6">
              Transform Learning with
              <span className="block">AI-Powered Quizzes</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Upload your study materials and watch as our AI creates engaging, intelligent quiz questions. 
              Engage students in real-time interactive sessions with instant feedback and live leaderboards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to={user.role === 'teacher' ? '/teacher' : '/student'} className="btn-secondary">
                  Continue to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-secondary">
                    Start Free Trial
                  </Link>
                  <Link to="/login" className="glass text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all duration-300">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-20 h-20 bg-white/10 rounded-full"></div>
        </div>
        <div className="absolute bottom-20 right-10 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-16 h-16 bg-white/10 rounded-full"></div>
        </div>
        <div className="absolute top-1/2 left-1/4 animate-float" style={{ animationDelay: '4s' }}>
          <div className="w-12 h-12 bg-white/10 rounded-full"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="stat-number">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose BrainSpark?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with intuitive design to create 
              the ultimate learning experience for teachers and students.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in minutes with our simple 3-step process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Upload Your Notes</h3>
              <p className="text-gray-600">Simply upload your PDF study materials to our platform</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Generates Questions</h3>
              <p className="text-gray-600">Our AI analyzes your content and creates intelligent quiz questions</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Start Live Sessions</h3>
              <p className="text-gray-600">Launch interactive quiz sessions with real-time student engagement</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-bg-secondary py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Teaching?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of educators who are already using BrainSpark to create engaging learning experiences.
          </p>
          {user ? (
            <Link to={user.role === 'teacher' ? '/teacher' : '/student'} className="btn-secondary">
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/register" className="btn-secondary">
              Get Started Free
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text mb-4">BrainSpark</div>
            <p className="text-gray-400 mb-6">
              Empowering education with AI-powered interactive learning
            </p>
            <div className="flex justify-center space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-gray-400">
              © 2024 BrainSpark. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 