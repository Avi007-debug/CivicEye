import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  MessageSquare,
  ThumbsUp,
  Calendar,
  Filter,
  TrendingUp,
  Users
} from 'lucide-react';

const TrackIssue = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filter, setFilter] = useState('all');
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    // Mock data for demonstration
    const mockIssues = [
      {
        id: 'CC2024001',
        title: 'Pothole on Main Street causing traffic issues',
        status: 'in-progress',
        priority: 'high',
        category: 'Roads & Transportation',
        location: 'Main Street, Sector 15, Delhi',
        reportedDate: '2024-01-15T10:30:00Z',
        lastUpdated: '2024-01-18T14:22:00Z',
        assignedTo: 'Public Works Department',
        upvotes: 45,
        comments: 12,
        timeline: [
          { status: 'reported', date: '2024-01-15T10:30:00Z', note: 'Issue reported by citizen' },
          { status: 'verified', date: '2024-01-15T16:45:00Z', note: 'Verified by field inspector' },
          { status: 'assigned', date: '2024-01-16T09:15:00Z', note: 'Assigned to Public Works Department' },
          { status: 'in-progress', date: '2024-01-18T14:22:00Z', note: 'Repair work has begun' }
        ],
        estimatedResolution: '2024-01-22'
      },
      {
        id: 'CC2024002',
        title: 'Broken street light on Park Avenue',
        status: 'resolved',
        priority: 'medium',
        category: 'Infrastructure',
        location: 'Park Avenue, Sector 22, Delhi',
        reportedDate: '2024-01-10T08:15:00Z',
        lastUpdated: '2024-01-17T11:30:00Z',
        assignedTo: 'Electricity Department',
        upvotes: 23,
        comments: 7,
        timeline: [
          { status: 'reported', date: '2024-01-10T08:15:00Z', note: 'Issue reported' },
          { status: 'verified', date: '2024-01-10T14:20:00Z', note: 'Verified and prioritized' },
          { status: 'assigned', date: '2024-01-11T10:00:00Z', note: 'Assigned to Electricity Department' },
          { status: 'in-progress', date: '2024-01-15T09:30:00Z', note: 'Electrician dispatched' },
          { status: 'resolved', date: '2024-01-17T11:30:00Z', note: 'Street light repaired and tested' }
        ],
        resolvedDate: '2024-01-17T11:30:00Z'
      },
      {
        id: 'CC2024003',
        title: 'Garbage collection delay in residential area',
        status: 'verified',
        priority: 'medium',
        category: 'Sanitation',
        location: 'Green Valley Society, Sector 45, Delhi',
        reportedDate: '2024-01-18T07:45:00Z',
        lastUpdated: '2024-01-18T16:10:00Z',
        assignedTo: 'Sanitation Department',
        upvotes: 18,
        comments: 4,
        timeline: [
          { status: 'reported', date: '2024-01-18T07:45:00Z', note: 'Issue reported by resident' },
          { status: 'verified', date: '2024-01-18T16:10:00Z', note: 'Verified by sanitation supervisor' }
        ],
        estimatedResolution: '2024-01-20'
      }
    ];
    setIssues(mockIssues);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported': return { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' };
      case 'verified': return { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' };
      case 'assigned': return { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' };
      case 'in-progress': return { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' };
      case 'resolved': return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const found = issues.find(issue => 
        issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (found) {
        setSelectedIssue(found);
      }
    }
  };

  const filteredIssues = filter === 'all' 
    ? issues 
    : issues.filter(issue => issue.status === filter);

  const renderTimeline = (timeline) => {
    return (
      <div className="space-y-4">
        {timeline.map((event, index) => {
          const statusColors = getStatusColor(event.status);
          return (
            <div key={index} className="flex items-start space-x-3">
              <div className={`w-3 h-3 rounded-full ${statusColors.dot} mt-1.5`}></div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusColors.bg} ${statusColors.text}`}>
                    {event.status.replace('-', ' ')}
                  </span>
                  <span className="text-sm text-gray-500">{formatDate(event.date)}</span>
                </div>
                <p className="text-sm text-gray-700">{event.note}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderIssueDetails = (issue) => {
    const statusColors = getStatusColor(issue.status);
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{issue.title}</h2>
              <p className="text-gray-600">Issue ID: <span className="font-semibold">{issue.id}</span></p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${statusColors.bg} ${statusColors.text}`}>
                {issue.status.replace('-', ' ')}
              </span>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(issue.priority)}`}>
                {issue.priority} priority
              </span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{issue.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Reported {formatDate(issue.reportedDate)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>Updated {formatDate(issue.lastUpdated)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <span className="w-4 h-4 mr-2 bg-blue-100 rounded text-center text-xs">🏢</span>
              <span>{issue.assignedTo}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Timeline</h3>
            {renderTimeline(issue.timeline)}
            
            {issue.status !== 'resolved' && issue.estimatedResolution && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Estimated resolution: {formatDate(issue.estimatedResolution)}
                </p>
              </div>
            )}

            {issue.status === 'resolved' && issue.resolvedDate && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <CheckCircle className="h-4 w-4 inline mr-1" />
                  Resolved on: {formatDate(issue.resolvedDate)}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Community Engagement</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    <span>Upvotes</span>
                  </div>
                  <span className="font-semibold text-gray-900">{issue.upvotes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span>Comments</span>
                  </div>
                  <span className="font-semibold text-gray-900">{issue.comments}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Issue Category</h4>
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {issue.category}
              </span>
            </div>

            {issue.status !== 'resolved' && (
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Upvote This Issue
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Comment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Your Issues</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Monitor the progress of your reported issues and see real-time updates from the relevant departments.
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter issue ID or search by keywords..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </button>
          </div>
        </div>

        {/* Selected Issue Details */}
        {selectedIssue && (
          <div className="mb-8">
            {renderIssueDetails(selectedIssue)}
          </div>
        )}

        {/* All Issues List */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Recent Issues</h2>
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="reported">Reported</option>
                  <option value="verified">Verified</option>
                  <option value="assigned">Assigned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredIssues.map((issue) => {
              const statusColors = getStatusColor(issue.status);
              return (
                <div
                  key={issue.id}
                  className="p-6 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  onClick={() => setSelectedIssue(issue)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{issue.title}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusColors.bg} ${statusColors.text}`}>
                          {issue.status.replace('-', ' ')}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                        <span className="font-medium text-blue-600">{issue.id}</span>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {issue.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(issue.reportedDate)}
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
                      <span className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackIssue;