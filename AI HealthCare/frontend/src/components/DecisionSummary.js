import React, { useState } from 'react';
import { Check, FileText, Calendar, Pill, Activity } from 'lucide-react';
import api from '../services/api';

function DecisionSummary({ patient, conversation, onClose, onSave }) {
  const [formData, setFormData] = useState({
    treatmentPlan: '',
    medications: [],
    lifestyleChanges: [],
    followUpDate: '',
    aiContributions: [
      'Initial patient data analysis',
      'Evidence-based recommendations',
      'Risk assessment and stratification',
      'Medical literature citations'
    ],
    doctorContributions: [
      'Clinical examination findings',
      'Patient-specific context',
      'Final treatment selection',
      'Safety considerations'
    ]
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.post('/api/decisions/create', {
        patient_id: patient.id,
        treatment_plan: { summary: formData.treatmentPlan },
        medications: formData.medications,
        lifestyle_recommendations: formData.lifestyleChanges,
        follow_up_date: formData.followUpDate,
        ai_contributions: formData.aiContributions,
        doctor_contributions: formData.doctorContributions,
        confidence: 0.85
      });

      alert('Decision saved successfully!');
      onSave && onSave(response.data);
      onClose();
    } catch (error) {
      console.error('Error saving decision:', error);
      alert('Error saving decision. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 sticky top-0">
          <h2 className="text-2xl font-bold">Finalize Collaborative Decision</h2>
          <p className="text-green-100 mt-1">Patient: {patient.name}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Treatment Plan Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={18} />
              Treatment Plan Summary
            </label>
            <textarea
              value={formData.treatmentPlan}
              onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows="4"
              placeholder="Summarize the agreed treatment approach..."
            />
          </div>

          {/* Medications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Pill size={18} />
              Medications
            </label>
            <MedicationList
              medications={formData.medications}
              onChange={(meds) => setFormData({ ...formData, medications: meds })}
            />
          </div>

          {/* Lifestyle Changes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Activity size={18} />
              Lifestyle Recommendations
            </label>
            <LifestyleList
              changes={formData.lifestyleChanges}
              onChange={(changes) => setFormData({ ...formData, lifestyleChanges: changes })}
            />
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={18} />
              Follow-up Date
            </label>
            <input
              type="date"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Contribution Breakdown */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">AI Contributions</h3>
              <ul className="space-y-2">
                {formData.aiContributions.map((contrib, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{contrib}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Doctor Contributions</h3>
              <ul className="space-y-2">
                {formData.doctorContributions.map((contrib, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>{contrib}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Estimated Contribution Percentages */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Estimated Contributions</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-blue-600 font-medium">AI: 45%</span>
                  <span className="text-purple-600 font-medium">Doctor: 55%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="flex h-full">
                    <div className="bg-blue-600" style={{ width: '45%' }}></div>
                    <div className="bg-purple-600" style={{ width: '55%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.treatmentPlan}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Decision'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Medication List Component
function MedicationList({ medications, onChange }) {
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '' });

  const addMedication = () => {
    if (newMed.name && newMed.dosage) {
      onChange([...medications, newMed]);
      setNewMed({ name: '', dosage: '', frequency: '' });
    }
  };

  const removeMedication = (index) => {
    onChange(medications.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {medications.map((med, idx) => (
        <div key={idx} className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
          <div className="flex-1">
            <p className="font-medium text-gray-900">{med.name}</p>
            <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
          </div>
          <button
            onClick={() => removeMedication(idx)}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            Remove
          </button>
        </div>
      ))}

      <div className="grid grid-cols-3 gap-2">
        <input
          type="text"
          placeholder="Medication name"
          value={newMed.name}
          onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <input
          type="text"
          placeholder="Dosage"
          value={newMed.dosage}
          onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <input
          type="text"
          placeholder="Frequency"
          value={newMed.frequency}
          onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <button
        onClick={addMedication}
        className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm"
      >
        + Add Medication
      </button>
    </div>
  );
}

// Lifestyle List Component
function LifestyleList({ changes, onChange }) {
  const [newChange, setNewChange] = useState('');

  const addChange = () => {
    if (newChange.trim()) {
      onChange([...changes, newChange]);
      setNewChange('');
    }
  };

  const removeChange = (index) => {
    onChange(changes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {changes.map((change, idx) => (
        <div key={idx} className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
          <span className="flex-1 text-gray-900">{change}</span>
          <button
            onClick={() => removeChange(idx)}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            Remove
          </button>
        </div>
      ))}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add lifestyle recommendation..."
          value={newChange}
          onChange={(e) => setNewChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addChange()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <button
          onClick={addChange}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default DecisionSummary;
