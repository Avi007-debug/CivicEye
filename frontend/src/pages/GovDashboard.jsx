import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Download,
  Users,
  MapPin
} from 'lucide-react';

const GovDashboard = () => {
  const { user, session } = useAuth();
  const token = session?.access_token;

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  useEffect(() => {
    const fetchGovDashboardData = async () => {
      if (!token) {
        setLoading(false);
        setError("Authentication token not found. Please log in.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5000/api/dashboard/government', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error: ${response.statusText}`);
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGovDashboardData();
  }, [token]);

  const getStatusColor = (status) => {
    const colors = {
      reported: 'bg-blue-100 text-blue-800',
      verified: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading Government Dashboard...</p></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-red-600 text-lg mb-4">Error: {error}</p>
          <Link to="/login" className="text-blue-600 hover:underline">Return to Login</Link>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="min-h-screen flex items-center justify-center"><p>No data available.</p></div>;
  }

  const { statistics = {}, recent_issues = [], category_breakdown = {}, status_breakdown = {} } = dashboardData;

  // Ensure charts always have data arrays
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  const categoryData = Object.entries(category_breakdown).map(([name, value], index) => ({
    name,
    value,
    fill: COLORS[index % COLORS.length]
  }));

  const statusData = Object.entries(status_breakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
    issues: value
  }));

  const departmentData = [
    { name: "Public Works", issues: 856, resolved: 724, avg_time: "4.2 days" },
    { name: "Transportation", issues: 634, resolved: 587, avg_time: "3.8 days" },
    { name: "Environment", issues: 423, resolved: 398, avg_time: "5.1 days" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center">
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
              <option value="year">This Year</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<AlertTriangle />} title="Total Issues" value={statistics.total_issues || 0} />
          <StatCard icon={<CheckCircle />} title="Resolved Issues" value={statistics.resolved_issues || 0} />
          <StatCard icon={<Clock />} title="In Progress" value={statistics.in_progress_issues || 0} />
          <StatCard icon={<TrendingUp />} title="Urgent Issues" value={statistics.urgent_issues || 0} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Status Breakdown</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="issues" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-sm">No status data available.</p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues by Category</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-sm">No category data available.</p>
            )}
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Department Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Issues</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resolved</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg. Resolution Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departmentData.map((dept, index) => {
                  const successRate = Math.round((dept.resolved / dept.issues) * 100);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{dept.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{dept.issues}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{dept.resolved}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${successRate}%` }}></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{successRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{dept.avg_time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* High Priority Issues */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">High Priority Issues</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recent_issues.filter(issue => issue.priority === 'high').length > 0 ? (
                recent_issues.filter(issue => issue.priority === 'high').map((issue) => (
                  <div key={issue.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">{issue.title}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(issue.priority)}`}>{issue.priority}</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(issue.status)}`}>{issue.status}</span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex items-center"><MapPin className="h-3 w-3 mr-1" />{issue.location_text || 'N/A'}</div>
                          <div className="flex items-center"><Clock className="h-3 w-3 mr-1" />{new Date(issue.created_at).toLocaleDateString()}</div>
                          <div className="flex items-center"><Users className="h-3 w-3 mr-1" />{issue.profiles?.full_name || 'N/A'}</div>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">Assign</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-6 text-gray-500 text-sm">No high priority issues found.</p>
              )}
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
                        className={`h-2 rounded-full ${workload > 80 ? 'bg-red-500' : workload > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${workload}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700">
                Optimize Resource Distribution
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
    <div className="p-3 rounded-full text-white bg-blue-500">
      {React.cloneElement(icon, { className: "h-6 w-6" })}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default GovDashboard;
