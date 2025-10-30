import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI } from '../services/api';
import { 
  ArrowLeft, 
  User, 
  Heart, 
  Activity, 
  Thermometer, 
  Droplet,
  Calendar,
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react';
import HealthChart from '../components/HealthChart';

function PatientDetails() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      const data = await patientAPI.getPatient(patientId);
      setPatient(data);
    } catch (error) {
      console.error('Error loading patient:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading patient data...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Patient not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
              <p className="text-sm text-gray-600">ID: {patient.id.substring(0, 8)}...</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-8">
            <TabButton
              label="Overview"
              isActive={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            />
            <TabButton
              label="Medical History"
              isActive={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
            />
            <TabButton
              label="Vital Signs"
              isActive={activeTab === 'vitals'}
              onClick={() => setActiveTab('vitals')}
            />
            <TabButton
              label="Decisions"
              isActive={activeTab === 'decisions'}
              onClick={() => setActiveTab('decisions')}
            />
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'overview' && <OverviewTab patient={patient} />}
            {activeTab === 'history' && <MedicalHistoryTab patient={patient} />}
            {activeTab === 'vitals' && <VitalsTab patient={patient} />}
            {activeTab === 'decisions' && <DecisionsTab />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Patient Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="text-blue-600" size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Patient Info</h3>
                  <p className="text-sm text-gray-500">Active</p>
                </div>
              </div>
              <div className="space-y-3">
                <InfoRow label="Gender" value={patient.gender || 'Not specified'} />
                <InfoRow label="Blood Type" value={patient.blood_type || 'Unknown'} />
                <InfoRow label="Height" value={patient.height ? `${patient.height} cm` : 'N/A'} />
                <InfoRow label="Weight" value={patient.weight ? `${patient.weight} kg` : 'N/A'} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ActionButton icon={<FileText size={18} />} label="Add Note" />
                <ActionButton icon={<Calendar size={18} />} label="Schedule Appointment" />
                <ActionButton icon={<Activity size={18} />} label="Record Vitals" />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <RecentActivityList />
            </div>

            {/* Previous Decisions - Sidebar Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Previous Decisions</h3>
              <div className="space-y-3">
                <DecisionHistoryItem
                  date="1 week ago"
                  decision="Medication adjustment"
                  outcome="Glucose improved to 140 mg/dL"
                />
                <DecisionHistoryItem
                  date="2 weeks ago"
                  decision="Started new medication"
                  outcome="Patient tolerating well"
                />
                <p className="text-sm text-gray-500 text-center py-4">
                  More decisions will appear here as you collaborate with AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Tab Button Component
function TabButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
        isActive
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );
}

// Overview Tab
function OverviewTab({ patient }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Patient Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Gender</p>
            <p className="text-lg font-semibold mt-1">{patient.gender || 'N/A'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Blood Type</p>
            <p className="text-lg font-semibold mt-1">{patient.blood_type || 'N/A'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Height</p>
            <p className="text-lg font-semibold mt-1">{patient.height ? `${patient.height} cm` : 'N/A'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Weight</p>
            <p className="text-lg font-semibold mt-1">{patient.weight ? `${patient.weight} kg` : 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Current Status</h3>
        <div className="space-y-3">
          <StatusItem status="active" label="Patient Status" />
          <StatusItem status="stable" label="Health Condition" />
          <StatusItem status="up-to-date" label="Records" />
        </div>
      </div>
    </div>
  );
}

// Medical History Tab
function MedicalHistoryTab({ patient }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Medical History</h3>
        <div className="prose max-w-none">
          <p className="text-gray-600">
            {patient.medical_history || 'No medical history recorded yet.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Allergies</h3>
        <div className="space-y-2">
          {patient.allergies ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{patient.allergies}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No known allergies</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Current Medications</h3>
        <div className="space-y-2">
          {patient.current_medications ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">{patient.current_medications}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No current medications</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Vitals Tab
function VitalsTab({ patient }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Latest Vital Signs</h3>
        <div className="grid grid-cols-2 gap-4">
          <VitalCard
            icon={<Heart className="text-red-500" />}
            label="Blood Pressure"
            value={patient.blood_pressure || 'N/A'}
            unit=""
          />
          <VitalCard
            icon={<Activity className="text-blue-500" />}
            label="Heart Rate"
            value={patient.heart_rate || 'N/A'}
            unit="bpm"
          />
          <VitalCard
            icon={<Thermometer className="text-orange-500" />}
            label="Temperature"
            value={patient.temperature || 'N/A'}
            unit="°F"
          />
          <VitalCard
            icon={<Droplet className="text-cyan-500" />}
            label="Oxygen Saturation"
            value={patient.oxygen_saturation || 'N/A'}
            unit="%"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Vital Signs History</h3>
        <p className="text-gray-500 text-sm">
          Vital signs tracking will appear here once recorded.
        </p>
      </div>
    </div>
  );
}

// Decisions Tab - Full Page View
function DecisionsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Decision History</h3>
        <div className="space-y-4">
          <DecisionHistoryItem
            date="1 week ago"
            decision="Medication adjustment"
            outcome="Glucose improved to 140 mg/dL"
          />
          <DecisionHistoryItem
            date="2 weeks ago"
            decision="Started new medication"
            outcome="Patient tolerating well"
          />
          <DecisionHistoryItem
            date="3 weeks ago"
            decision="Ordered additional blood work"
            outcome="Results within normal range"
          />
          <DecisionHistoryItem
            date="1 month ago"
            decision="Referral to specialist"
            outcome="Consultation completed"
          />
        </div>
        <p className="text-sm text-gray-500 text-center py-4 border-t mt-4">
          More decisions will appear here as you collaborate with AI
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Add New Decision</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decision Type
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>Medication Change</option>
              <option>Test Order</option>
              <option>Treatment Plan Update</option>
              <option>Referral</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decision Details
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Describe the decision made..."
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Outcome
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="What outcome do you expect?"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Record Decision
          </button>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 mt-1">
            <Activity size={20} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              AI-Assisted Decision Making
            </h4>
            <p className="text-sm text-blue-800">
              Use the AI chat feature to get insights and recommendations before making critical decisions.
              All AI suggestions will be logged here for your review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Decision History Item Component
function DecisionHistoryItem({ date, decision, outcome }) {
  return (
    <div className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{decision}</p>
        <p className="text-sm text-gray-600">{outcome}</p>
        <p className="text-xs text-gray-400 mt-1">{date}</p>
      </div>
    </div>
  );
}

// Helper Components
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function ActionButton({ icon, label }) {
  return (
    <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition">
      <div className="text-blue-600">{icon}</div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  );
}

function StatusItem({ status, label }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'stable':
        return 'bg-blue-100 text-blue-800';
      case 'up-to-date':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(status)}`}>
        {status}
      </span>
    </div>
  );
}

function VitalCard({ icon, label, value, unit }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-sm text-gray-600">{label}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {value} <span className="text-sm text-gray-500">{unit}</span>
      </p>
    </div>
  );
}

function RecentActivityList() {
  const activities = [
    { action: 'Vitals recorded', time: '2 hours ago' },
    { action: 'Prescription updated', time: '1 day ago' },
    { action: 'Lab results reviewed', time: '3 days ago' },
  ];

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
          <div>
            <p className="text-sm text-gray-900">{activity.action}</p>
            <p className="text-xs text-gray-500">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PatientDetails;