import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import { aiAPI } from '../services/api';
import DecisionSummary from './DecisionSummary';

function AIChat({ patient, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialAnalysis, setInitialAnalysis] = useState(null);
  const [showDecisionSummary, setShowDecisionSummary] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Generate initial AI analysis when chat opens
    generateInitialAnalysis();
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateInitialAnalysis = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.analyzePatient(patient.id);
      setInitialAnalysis(response.analysis);
      
      // Add initial AI message
      const aiMessage = {
        speaker: 'ai',
        content: formatInitialAnalysis(response.analysis),
        timestamp: new Date().toISOString()
      };
      
      setMessages([aiMessage]);
    } catch (error) {
      console.error('Error generating analysis:', error);
      setMessages([{
        speaker: 'ai',
        content: 'Hello! I\'m ready to discuss this patient\'s care. What would you like to know?',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatInitialAnalysis = (analysis) => {
    return `**Patient Analysis Complete**

**Key Findings:**
${analysis.findings}

**Concerns Identified:**
${analysis.concerns?.map((c, i) => `${i + 1}. ${c}`).join('\n')}

**Risk Level:** ${analysis.risk_level?.toUpperCase()}

**Recommendations:**
${analysis.recommendations}

**Confidence:** ${(analysis.confidence_score * 100).toFixed(0)}%

What are your thoughts on these findings, Doctor?`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    // Add doctor message
    const doctorMessage = {
      speaker: 'doctor',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, doctorMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // Get AI response
      const response = await aiAPI.chatWithAI(messages, inputMessage);
      
      // Add AI response
      const aiMessage = {
        speaker: 'ai',
        content: response.ai_response,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        speaker: 'ai',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">AI Consultation</h2>
              <p className="text-blue-100 mt-1">
                Discussing: {patient.name} ({patient.condition})
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDecisionSummary(true)}
                className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 transition"
              >
                Finalize Decision
              </button>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg px-4 py-2 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          
          {loading && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader className="animate-spin" size={20} />
              <span>AI is thinking...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
          {/* Quick Action Buttons */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <QuickButton
              label="What's your assessment?"
              onClick={() => setInputMessage("What's your overall assessment of this patient?")}
            />
            <QuickButton
              label="Medication options?"
              onClick={() => setInputMessage("What medication options do you recommend?")}
            />
            <QuickButton
              label="Any concerns?"
              onClick={() => setInputMessage("Do you have any specific concerns I should address?")}
            />
          </div>

          <div className="flex gap-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message to AI..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="2"
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={20} />
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Decision Summary Modal */}
      {showDecisionSummary && (
        <DecisionSummary
          patient={patient}
          conversation={messages}
          onClose={() => setShowDecisionSummary(false)}
          onSave={(decision) => {
            console.log('Decision saved:', decision);
            setShowDecisionSummary(false);
            onClose();
          }}
        />
      )}
    </div>
  );
}

// Chat Message Component
function ChatMessage({ message }) {
  const isAI = message.speaker === 'ai';
  
  return (
    <div className={`flex items-start gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        isAI ? 'bg-blue-100' : 'bg-purple-100'
      }`}>
        {isAI ? (
          <Bot className="text-blue-600" size={20} />
        ) : (
          <User className="text-purple-600" size={20} />
        )}
      </div>

      {/* Message Bubble */}
      <div className={`flex-1 ${isAI ? 'mr-12' : 'ml-12'}`}>
        <div className={`rounded-lg p-4 ${
          isAI 
            ? 'bg-white border border-gray-200' 
            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
        }`}>
          <div className="text-sm font-medium mb-1">
            {isAI ? 'AI Assistant' : 'You (Doctor)'}
          </div>
          <div className="text-sm whitespace-pre-wrap">
            {message.content}
          </div>
          <div className={`text-xs mt-2 ${
            isAI ? 'text-gray-400' : 'text-blue-100'
          }`}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Button Component
function QuickButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition"
    >
      {label}
    </button>
  );
}

export default AIChat;