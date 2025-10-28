import os
import json
from openai import OpenAI
from datetime import datetime

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

class AIHealthAnalyzer:
    """AI service for analyzing patient health data"""
    
    def __init__(self):
        self.model = "gpt-4o-mini"  # or "gpt-3.5-turbo" for cheaper option
    
    def analyze_patient_data(self, patient_data, vital_signs, health_logs):
        """
        Analyze patient data and generate health insights
        
        Args:
            patient_data: Patient demographic and medical history
            vital_signs: Recent vital signs from wearable device
            health_logs: Manual health logs from patient
        
        Returns:
            AI analysis with findings, concerns, and recommendations
        """
        
        # Create comprehensive prompt
        prompt = self._create_analysis_prompt(patient_data, vital_signs, health_logs)
        
        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """You are a medical AI assistant helping doctors analyze patient health data. 
                        You provide evidence-based analysis, identify concerning patterns, and suggest treatment options.
                        Always cite medical guidelines when relevant. Be clear about confidence levels.
                        Format your response as JSON with these fields: findings, concerns, risk_level, recommendations, evidence."""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1000,
                response_format={"type": "json_object"}
            )
            
            # Parse AI response
            ai_response = json.loads(response.choices[0].message.content)
            
            # Add metadata
            ai_response['confidence_score'] = 0.85  # Can be calculated based on data quality
            ai_response['generated_at'] = datetime.utcnow().isoformat()
            ai_response['model_used'] = self.model
            
            return ai_response
            
        except Exception as e:
            print(f"Error calling OpenAI API: {e}")
            return self._fallback_analysis()
    
    def _create_analysis_prompt(self, patient_data, vital_signs, health_logs):
        """Create detailed prompt for AI analysis"""
        
        prompt = f"""
Analyze this patient's health data and provide medical insights:

PATIENT INFORMATION:
- Name: {patient_data.get('name', 'Unknown')}
- Age: {patient_data.get('age', 'Unknown')}
- Gender: {patient_data.get('gender', 'Unknown')}
- Medical History: {patient_data.get('chronic_conditions', 'None reported')}
- Current Medications: {patient_data.get('medications', 'None reported')}

RECENT VITAL SIGNS (from wearable device):
{self._format_vital_signs(vital_signs)}

RECENT HEALTH LOGS (patient reported):
{self._format_health_logs(health_logs)}

Please provide:
1. Key findings from the data
2. Any concerning patterns or anomalies
3. Overall risk level (low/moderate/high/critical)
4. Evidence-based treatment recommendations
5. Relevant medical guidelines or studies

Format your response as JSON with fields: findings, concerns, risk_level, recommendations, evidence.
"""
        return prompt
    
    def _format_vital_signs(self, vital_signs):
        """Format vital signs for prompt"""
        if not vital_signs:
            return "No recent vital signs data available"
        
        formatted = []
        for vs in vital_signs[-7:]:  # Last 7 days
            formatted.append(f"- {vs.get('date')}: HR {vs.get('heart_rate')} bpm, "
                           f"SpO2 {vs.get('spo2')}%, Sleep {vs.get('sleep_score')}/100")
        
        return "\n".join(formatted) if formatted else "No data"
    
    def _format_health_logs(self, health_logs):
        """Format health logs for prompt"""
        if not health_logs:
            return "No recent health logs"
        
        formatted = []
        for log in health_logs[-5:]:  # Last 5 entries
            formatted.append(f"- {log.get('date')}: BP {log.get('blood_pressure')}, "
                           f"Glucose {log.get('glucose')} mg/dL, Notes: {log.get('notes', 'None')}")
        
        return "\n".join(formatted) if formatted else "No data"
    
    def _fallback_analysis(self):
        """Fallback response if API fails"""
        return {
            "findings": "Unable to generate AI analysis at this time.",
            "concerns": ["API connection issue"],
            "risk_level": "unknown",
            "recommendations": ["Please review patient data manually"],
            "evidence": [],
            "confidence_score": 0.0,
            "generated_at": datetime.utcnow().isoformat(),
            "model_used": "fallback"
        }
    
    def generate_treatment_proposal(self, patient_context, ai_analysis):
        """
        Generate detailed treatment proposal based on analysis
        
        Args:
            patient_context: Patient information and history
            ai_analysis: Previous AI analysis results
        
        Returns:
            Structured treatment proposal with medications, lifestyle changes, etc.
        """
        
        prompt = f"""
Based on this patient analysis, generate a detailed treatment proposal:

PATIENT CONTEXT:
{json.dumps(patient_context, indent=2)}

AI ANALYSIS:
{json.dumps(ai_analysis, indent=2)}

Provide a comprehensive treatment proposal including:
1. Primary medication recommendations with dosing
2. Supporting lifestyle modifications
3. Diagnostic tests if needed
4. Follow-up schedule
5. Patient education points
6. Potential risks and contraindications

Format as JSON with fields: medications, lifestyle_changes, diagnostic_tests, 
follow_up_plan, patient_education, risks, rationale.
"""
        
        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """You are a medical AI providing treatment recommendations. 
                        Base recommendations on current clinical guidelines. Include evidence citations.
                        Consider patient-specific factors like age, comorbidities, and current medications."""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1500,
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            print(f"Error generating treatment proposal: {e}")
            return {
                "medications": [],
                "lifestyle_changes": [],
                "diagnostic_tests": [],
                "follow_up_plan": "Unable to generate proposal",
                "error": str(e)
            }
    
    def chat_with_doctor(self, conversation_history, doctor_message):
        """
        Handle doctor-AI conversation for collaborative decision making
        
        Args:
            conversation_history: List of previous messages
            doctor_message: Current message from doctor
        
        Returns:
            AI response considering full conversation context
        """
        
        # Build conversation context
        messages = [
            {
                "role": "system",
                "content": """You are a medical AI collaborating with a doctor on patient care.
                Engage in professional dialogue, consider the doctor's input seriously,
                adjust your recommendations based on their feedback, and acknowledge when they
                raise valid concerns or provide information you didn't have access to.
                Maintain a collaborative, not confrontational, tone."""
            }
        ]
        
        # Add conversation history
        for msg in conversation_history:
            messages.append({
                "role": "assistant" if msg['speaker'] == 'ai' else "user",
                "content": msg['content']
            })
        
        # Add current doctor message
        messages.append({
            "role": "user",
            "content": doctor_message
        })
        
        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.8,
                max_tokens=800
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error in doctor chat: {e}")
            return "I apologize, but I'm having trouble responding right now. Please try again."

# Initialize global AI analyzer instance
ai_analyzer = AIHealthAnalyzer()