import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Smartphone,
  Bot,
  Globe,
  Award,
  ArrowRight,
  Play
} from 'lucide-react';

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Smart Geo-tagging",
      description: "Automatic location detection with Google Maps integration",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Bot className="h-8 w-8" />,
      title: "AI Classification",
      description: "Advanced AI analyzes and categorizes issues automatically",
      color: "from-teal-500 to-teal-600"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Crowd Validation",
      description: "Community-driven upvoting and priority scoring",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Multi-language Support",
      description: "Voice-based reporting in multiple languages",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const stats = [
    { label: "Issues Reported", value: "12,543", change: "+18%" },
    { label: "Issues Resolved", value: "9,876", change: "+25%" },
    { label: "Active Users", value: "45,231", change: "+12%" },
    { label: "Avg. Resolution Time", value: "3.2 days", change: "-15%" }
  ];

  const trackingSteps = [
    { status: "Reported", color: "bg-blue-500", description: "Issue submitted by citizen" },
    { status: "Verified", color: "bg-yellow-500", description: "Reviewed by authorities" },
    { status: "Assigned", color: "bg-orange-500", description: "Assigned to relevant department" },
    { status: "Resolved", color: "bg-green-500", description: "Issue successfully resolved" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Transform Your City with
              <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent"> Smart Reporting</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Report civic issues instantly with AI-powered classification, real-time tracking, and community validation. 
              Making cities smarter, one report at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/report"
                className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
              >
                Report Issue Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/track"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-200 flex items-center"
              >
                <Play className="mr-2 h-5 w-5" />
                Track Issues
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center p-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 mb-2">{stat.label}</div>
                <div className="text-green-600 text-sm font-semibold">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Smart Cities
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced technology meets civic engagement to create seamless reporting experiences
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer ${
                  activeFeature === index ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracking Process */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              End-to-End Issue Tracking
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Complete transparency from report submission to resolution
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0">
            {trackingSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center max-w-xs">
                <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg`}>
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.status}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
                {index < trackingSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-teal-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Multiple Ways to Report
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Choose your preferred method - web portal, mobile app, WhatsApp, or Telegram
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Smartphone className="h-12 w-12" />, title: "Mobile App", desc: "iOS & Android apps" },
              { icon: <Bot className="h-12 w-12" />, title: "WhatsApp Bot", desc: "Report via WhatsApp" },
              { icon: <Bot className="h-12 w-12" />, title: "Telegram Bot", desc: "Report via Telegram" }
            ].map((method, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                <div className="text-white mb-4 flex justify-center">{method.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{method.title}</h3>
                <p className="text-blue-100">{method.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of citizens already making their communities better
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Get Started Today
            </Link>
            <Link
              to="/help"
              className="border-2 border-gray-600 text-gray-300 px-8 py-4 rounded-lg font-semibold text-lg hover:border-white hover:text-white transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;