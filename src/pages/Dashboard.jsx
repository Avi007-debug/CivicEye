import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  Clock, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  CheckCircle,
  ThumbsUp,
  MessageSquare,
  Calendar,
  Filter
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Mock data for user's reported issues
    const mockIssues = [
      {
        id: 1,
        title: "Pothole on Main Street",
        status: "in-progress",
        priority: "high",
        location: "Main Street, Downtown",
        date: "2024-01-15",
        upvotes: 23,
        comments: 5,
        category: "Roads"
      },
      {
        id: 2,
        title: "Broken Street Light",
        status: "resolved",
        priority: "medium",
        location: "Park Avenue",
        date: "2024-01-10",
        upvotes: 12,
        comments: 3,
        category: "Lighting"
      },
      {
        id: 3,
        title: "Garbage Collection Delay",
        status: "reported",
        priority: "low",
        location: "Residential Area",
        date: "2024-01-18",
        upvotes: 8,
        comments: 2,
        category: "Sanitation"
      }
    ];
    setIssues(mockIssues);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredIssues = filter === 'all' ? issues : issues.filter(issue => issue.status === filter);

  const stats = [
    { label: "Total Reports", value: issues.length, icon: <AlertTriangle className="h-6 w-6" />, color: "bg-blue-500" },
    { label: "Resolved", value: issues.filter(i => i.status === 'resolved').length, icon: <CheckCircle className="h-6 w-6" />, color: "bg-green-500" },
    { label: "In Progress", value: issues.filter(i => i.status === 'in-progress').length, icon: <Clock className="h-6 w-6" />, color: "bg-orange-500" },
    { label: "Civic Points", value: 150, icon: <Award className="h-6 w-6" />, color: "bg-purple-500" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">Track your reported issues and earn civic points for community contributions.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg text-white mr-4`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-4 rounded-lg font-medium hover:from-blue-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105">
              Report New Issue
            </button>
            <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105">
              Emergency Report
            </button>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105">
              Community Forum
            </button>
          </div>
        </div>

        {/* Issues List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Your Reported Issues</h2>
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Issues</option>
                  <option value="reported">Reported</option>
                  <option value="verified">Verified</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredIssues.map((issue) => (
              <div key={issue.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{issue.title}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(issue.status)}`}>
                        {issue.status.replace('-', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {issue.location}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(issue.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{issue.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 mt-4 lg:mt-0">
                    <div className="flex items-center text-sm text-gray-500">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {issue.upvotes}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {issue.comments}
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gamification Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-md p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Civic Engagement Level</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-purple-100">Current Level: Community Champion</p>
              <p className="text-sm text-purple-200">150 / 200 points to next level</p>
            </div>
            <Award className="h-12 w-12 text-yellow-300" />
          </div>
          <div className="w-full bg-purple-400 rounded-full h-2">
            <div className="bg-yellow-300 h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;