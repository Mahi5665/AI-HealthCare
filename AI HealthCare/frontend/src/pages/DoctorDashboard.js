import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, patientAPI } from '../services/api';
import { Users, Activity, Clock, AlertCircle, LogOut, Search, ChevronRight } from 'lucide-react';
import AIChat from '../components/AIChat';

function DoctorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      
      // Load patients list
      try {
        const patientsData = await patientAPI.getPatients();
        setPatients(patientsData.patients || []);
      } catch (err) {
        console.error('Error loading patients:', err);
        setPatients([]);
      }
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

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setShowAIChat(true);
  };

  const filteredPatients = patients.filter(patient => 
    searchTerm === '' || 
    patient.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome, Dr. {user?.first_name} {user?.last_name}
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="text-blue-500" size={24} />}
            title="Total Patients"
            value={patients.length.toString()}
            subtitle="Active cases"
          />
          <StatCard
            icon={<Activity className="text-green-500" size={24} />}
            title="AI Analyses"
            value="12"
            subtitle="Pending review"
          />
          <StatCard
            icon={<Clock className="text-orange-500" size={24} />}
            title="Appointments"
            value="5"
            subtitle="Today"
          />
          <StatCard
            icon={<AlertCircle className="text-red-500" size={24} />}
            title="Alerts"
            value="3"
            subtitle="Require attention"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patients List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">My Patients</h2>
                  <span className="text-sm text-gray-500">{patients.length} total</span>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="divide-y">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <PatientCard 
                      key={patient.id} 
                      patient={patient}
                      onClick={() => handlePatientClick(patient)}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    {searchTerm ? 'No patients found' : 'No patients yet'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending AI Analyses */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Pending AI Analyses</h3>
              <PendingAnalyses />
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
              <RecentAlerts />
            </div>
          </div>
        </div>
      </main>

      {/* AI Chat Modal */}
      {showAIChat && selectedPatient && (
        <AIChat
          patient={selectedPatient}
          onClose={() => setShowAIChat(false)}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, subtitle }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

// Patient Card Component
function PatientCard({ patient, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="p-4 hover:bg-gray-50 cursor-pointer transition"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="text-blue-600" size={24} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Patient ID: {patient.id.substring(0, 8)}...</h4>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm text-gray-500">
                {patient.gender || 'Not specified'}
              </span>
              <span className="text-sm text-gray-500">
                {patient.blood_type || 'Unknown'}
              </span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>
        <ChevronRight className="text-gray-400" size={20} />
      </div>
    </div>
  );
}

// Pending Analyses Component
function PendingAnalyses() {
  const analyses = [
    { patient: 'John Smith', issue: 'Elevated heart rate', time: '2 hours ago', severity: 'moderate' },
    { patient: 'Sarah Johnson', issue: 'Sleep pattern anomaly', time: '5 hours ago', severity: 'low' },
    { patient: 'Mike Wilson', issue: 'Blood pressure spike', time: '1 day ago', severity: 'high' },
  ];

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-3">
      {analyses.map((analysis, index) => (
        <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-medium text-gray-900">{analysis.patient}</p>
            <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(analysis.severity)}`}>
              {analysis.severity}
            </span>
          </div>
          <p className="text-sm text-gray-600">{analysis.issue}</p>
          <p className="text-xs text-gray-400 mt-1">{analysis.time}</p>
        </div>
      ))}
    </div>
  );
}

// Recent Alerts Component
function RecentAlerts() {
  const alerts = [
    { message: 'Patient medication reminder', time: '10 min ago', type: 'info' },
    { message: 'New AI analysis ready', time: '1 hour ago', type: 'success' },
    { message: 'Critical vitals detected', time: '3 hours ago', type: 'warning' },
  ];

  const getAlertIcon = (type) => {
    switch(type) {
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '📌';
    }
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <div key={index} className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-lg">{getAlertIcon(alert.type)}</span>
            <div className="flex-1">
              <p className="text-sm text-gray-900">{alert.message}</p>
              <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DoctorDashboard;