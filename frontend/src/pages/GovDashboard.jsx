import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  MapPin, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Filter,
  Download,
  Calendar
} from 'lucide-react';

const GovDashboard = () => {
  const { user } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const stats = [
    { label: "Total Issues", value: "2,547", change: "+12%", icon: <AlertTriangle className="h-6 w-6" />, color: "bg-blue-500" },
    { label: "Pending Review", value: "156", change: "-8%", icon: <Clock className="h-6 w-6" />, color: "bg-yellow-500" },
    { label: "In Progress", value: "89", change: "+15%", icon: <TrendingUp className="h-6 w-6" />, color: "bg-orange-500" },
    { label: "Resolved", value: "2,302", change: "+18%", icon: <CheckCircle className="h-6 w-6" />, color: "bg-green-500" }
  ];

  const departmentData = [
    { name: "Public Works", issues: 856, resolved: 724, avg_time: "4.2 days" },
    { name: "Transportation", issues: 634, resolved: 587, avg_time: "3.8 days" },
    { name: "Environment", issues: 423, resolved: 398, avg_time: "5.1 days" },
    { name: "Public Safety", issues: 312, resolved: 289, avg_time: "2.5 days" },
    { name: "Utilities", issues: 322, resolved: 304, avg_time: "3.2 days" }
  ];

  const recentIssues = [
    {
      id: 1,
      title: "Water pipe burst on Oak Street",
      priority: "high",
      department: "Utilities",
      location: "Oak Street, Sector 15",
      reported: "2 hours ago",
      status: "assigned",
      upvotes: 45
    },
    {
      id: 2,
      title: "Traffic light malfunction",
      priority: "high",
      department: "Transportation",
      location: "Main St & 5th Ave",
      reported: "4 hours ago",
      status: "in-progress",
      upvotes: 23
    },
    {
      id: 3,
      title: "Illegal dumping in park area",
      priority: "medium",
      department: "Environment",
      location: "Central Park",
      reported: "6 hours ago",
      status: "verified",
      upvotes: 18
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Government Dashboard</h1>
              <p className="text-gray-600 mt-2">Monitor and manage civic issues across all departments</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-sm font-semibold mt-1 ${
                    stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} from last period
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Department Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Issues
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resolved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Resolution Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departmentData.map((dept, index) => {
                  const successRate = Math.round((dept.resolved / dept.issues) * 100);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {dept.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dept.issues}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dept.resolved}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${successRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{successRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dept.avg_time}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Recent High Priority Issues */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">High Priority Issues</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentIssues.map((issue) => (
                <div key={issue.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">{issue.title}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {issue.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {issue.reported}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {issue.upvotes} citizens affected
                        </div>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                      Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Planning */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Resource Allocation</h2>
            <div className="space-y-4">
              {departmentData.slice(0, 3).map((dept, index) => {
                const workload = Math.min(100, (dept.issues - dept.resolved) * 2);
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                      <span className="text-sm text-gray-500">{dept.issues - dept.resolved} pending</span>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          workload > 80 ? 'bg-red-500' : workload > 50 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${workload}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
                Optimize Resource Distribution
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg shadow-md p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">City Performance Insights</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">4.2 days</div>
              <div className="text-blue-100">Average Resolution Time</div>
              <div className="text-sm text-blue-200 mt-1">↓ 15% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">92%</div>
              <div className="text-blue-100">Citizen Satisfaction</div>
              <div className="text-sm text-blue-200 mt-1">↑ 8% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">$2.4M</div>
              <div className="text-blue-100">Cost Savings</div>
              <div className="text-sm text-blue-200 mt-1">↑ 12% efficiency gain</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovDashboard;