import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Heart, Activity, Droplet, Moon, TrendingUp, LogOut, User, Calendar } from 'lucide-react';
import HealthChart from '../components/HealthChart';
import AnalyticsSummary from '../components/AnalyticsSummary';

function PatientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock chart data (7 days)
  const mockHeartRateData = [
    { date: 'Mon', heartRate: 72 },
    { date: 'Tue', heartRate: 75 },
    { date: 'Wed', heartRate: 70 },
    { date: 'Thu', heartRate: 73 },
    { date: 'Fri', heartRate: 71 },
    { date: 'Sat', heartRate: 74 },
    { date: 'Sun', heartRate: 72 },
  ];
  
  const mockGlucoseData = [
    { date: 'Mon', glucose: 165 },
    { date: 'Tue', glucose: 158 },
    { date: 'Wed', glucose: 162 },
    { date: 'Thu', glucose: 155 },
    { date: 'Fri', glucose: 160 },
    { date: 'Sat', glucose: 152 },
    { date: 'Sun', glucose: 148 },
  ];
  
  const mockSleepData = [
    { date: 'Mon', score: 68 },
    { date: 'Tue', score: 72 },
    { date: 'Wed', score: 65 },
    { date: 'Thu', score: 70 },
    { date: 'Fri', score: 75 },
    { date: 'Sat', score: 80 },
    { date: 'Sun', score: 82 },
  ];
  
  const mockStepsData = [
    { date: 'Mon', steps: 6543 },
    { date: 'Tue', steps: 7234 },
    { date: 'Wed', steps: 5876 },
    { date: 'Thu', steps: 8123 },
    { date: 'Fri', steps: 6789 },
    { date: 'Sat', steps: 9234 },
    { date: 'Sun', steps: 7654 },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.first_name} {user?.last_name}!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Heart className="text-red-500" size={24} />}
            title="Heart Rate"
            value="72 bpm"
            trend="+2%"
            trendUp={true}
          />
          <StatCard
            icon={<Activity className="text-blue-500" size={24} />}
            title="Steps Today"
            value="6,543"
            trend="+15%"
            trendUp={true}
          />
          <StatCard
            icon={<Droplet className="text-cyan-500" size={24} />}
            title="Blood Oxygen"
            value="98%"
            trend="Normal"
            trendUp={true}
          />
          <StatCard
            icon={<Moon className="text-purple-500" size={24} />}
            title="Sleep Score"
            value="82/100"
            trend="+5"
            trendUp={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Health Data Entry */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Log Health Data</h2>
            <HealthDataForm />
          </div>

          {/* Profile Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User size={20} />
              Your Profile
            </h2>
            <ProfileInfo user={user} />
          </div>
        </div>

        {/* Weekly Analytics */}
        <div className="mt-8 mb-8">
          <AnalyticsSummary
            title="This Week's Progress"
            metrics={[
              { label: 'Average Heart Rate', current: 72, previous: 74, unit: ' bpm', goal: 70 },
              { label: 'Average Glucose', current: 158, previous: 165, unit: ' mg/dL', goal: 130 },
              { label: 'Sleep Score', current: 73, previous: 68, unit: '/100', goal: 85 },
              { label: 'Daily Steps', current: 7350, previous: 6543, unit: '', goal: 10000 },
            ]}
          />
        </div>

        {/* Health Trends Charts */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HealthChart
            title="Heart Rate Trend (7 Days)"
            data={mockHeartRateData}
            dataKey="heartRate"
            color="#ef4444"
            unit=" bpm"
          />
          <HealthChart
            title="Blood Glucose (7 Days)"
            data={mockGlucoseData}
            dataKey="glucose"
            color="#8b5cf6"
            unit=" mg/dL"
          />
          <HealthChart
            title="Sleep Quality (7 Days)"
            data={mockSleepData}
            dataKey="score"
            color="#3b82f6"
            unit="/100"
          />
          <HealthChart
            title="Steps per Day (7 Days)"
            data={mockStepsData}
            dataKey="steps"
            color="#10b981"
            unit=""
          />
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Recent Activity
          </h2>
          <RecentActivity />
        </div>
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, trend, trendUp }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        <div className={`flex items-center gap-1 text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp size={16} />
          <span>{trend}</span>
        </div>
      </div>
      <h3 className="text-gray-600 text-sm">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

// Profile Info Component
function ProfileInfo({ user }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between py-2 border-b">
        <span className="text-gray-600">Name:</span>
        <span className="font-medium">{user?.first_name} {user?.last_name}</span>
      </div>
      <div className="flex justify-between py-2 border-b">
        <span className="text-gray-600">Email:</span>
        <span className="font-medium">{user?.email}</span>
      </div>
      <div className="flex justify-between py-2 border-b">
        <span className="text-gray-600">Role:</span>
        <span className="font-medium capitalize">{user?.role}</span>
      </div>
      <div className="flex justify-between py-2 border-b">
        <span className="text-gray-600">Member Since:</span>
        <span className="font-medium">
          {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
        </span>
      </div>
    </div>
  );
}

// Health Data Form Component
function HealthDataForm() {
  const [formData, setFormData] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    glucose: '',
    weight: '',
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
   
    // Validation
    const systolic = parseInt(formData.bloodPressureSystolic);
    const diastolic = parseInt(formData.bloodPressureDiastolic);
    const glucose = parseInt(formData.glucose);
   
    if (systolic && (systolic < 70 || systolic > 200)) {
      alert('Blood pressure systolic must be between 70-200');
      return;
    }
   
    if (diastolic && (diastolic < 40 || diastolic > 130)) {
      alert('Blood pressure diastolic must be between 40-130');
      return;
    }
   
    if (glucose && (glucose < 40 || glucose > 400)) {
      alert('Glucose must be between 40-400 mg/dL');
      return;
    }
   
    console.log('Health data submitted:', formData);
    alert('Health data logged successfully! 🎉');
    setFormData({
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      glucose: '',
      weight: '',
      notes: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            BP Systolic
          </label>
          <input
            type="number"
            value={formData.bloodPressureSystolic}
            onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="120"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            BP Diastolic
          </label>
          <input
            type="number"
            value={formData.bloodPressureDiastolic}
            onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="80"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Blood Glucose (mg/dL)
          </label>
          <input
            type="number"
            value={formData.glucose}
            onChange={(e) => setFormData({ ...formData, glucose: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="70.5"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="How are you feeling today?"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
      >
        Log Health Data
      </button>
    </form>
  );
}

// Recent Activity Component
function RecentActivity() {
  const activities = [
    { date: 'Today, 9:30 AM', activity: 'Logged blood pressure: 120/80', type: 'health' },
    { date: 'Yesterday, 8:00 PM', activity: 'Completed daily steps goal', type: 'achievement' },
    { date: 'Oct 25, 2:15 PM', activity: 'AI Analysis completed', type: 'ai' },
    { date: 'Oct 24, 10:00 AM', activity: 'Doctor consultation scheduled', type: 'appointment' },
  ];

  const getActivityColor = (type) => {
    switch(type) {
      case 'health': return 'bg-blue-100 text-blue-800';
      case 'achievement': return 'bg-green-100 text-green-800';
      case 'ai': return 'bg-purple-100 text-purple-800';
      case 'appointment': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-3">
      {activities.map((item, index) => (
        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getActivityColor(item.type)}`}>
            {item.type}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{item.activity}</p>
            <p className="text-xs text-gray-500">{item.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PatientDashboard;