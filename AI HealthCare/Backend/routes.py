from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User, Patient, Doctor, AIAnalyses, FinalDecisions
from datetime import datetime, date


api = Blueprint('api', __name__)

@api.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'AI HealthCare API is running!',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

@api.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        required_fields = ['email', 'password', 'role', 'first_name', 'last_name']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        user = User(
            email=data['email'],
            role=data['role'],
            first_name=data['first_name'],
            last_name=data['last_name']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.flush()
        
        if data['role'] == 'patient':
            patient = Patient(
                user_id=user.id,
                date_of_birth=date.fromisoformat(data.get('date_of_birth', '2000-01-01')),
                gender=data.get('gender'),
                blood_type=data.get('blood_type')
            )
            db.session.add(patient)
        
        elif data['role'] == 'doctor':
            doctor = Doctor(
                user_id=user.id,
                license_number=data.get('license_number'),
                specialization=data.get('specialization'),
                years_of_experience=data.get('years_of_experience', 0)
            )
            db.session.add(doctor)
        
        db.session.commit()
        
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'access_token': access_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@api.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/patients', methods=['GET'])
@jwt_required()
def get_patients():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'doctor':
            return jsonify({'error': 'Unauthorized'}), 403
        
        patients = Patient.query.all()
        
        return jsonify({
            'patients': [p.to_dict() for p in patients]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

from ai_service import ai_analyzer

@api.route('/ai/analyze/<patient_id>', methods=['POST'])
@jwt_required()
def analyze_patient(patient_id):
    """Generate AI analysis for a patient"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        # Only doctors can request AI analysis
        if user.role != 'doctor':
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get patient data
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Mock data for now (replace with real data later)
        patient_data = {
            'name': patient.user.first_name + ' ' + patient.user.last_name,
            'age': 52,
            'gender': patient.gender,
            'chronic_conditions': ['Type 2 Diabetes'],
            'medications': ['Metformin 500mg BID']
        }
        
        vital_signs = [
            {'date': '2025-10-20', 'heart_rate': 78, 'spo2': 97, 'sleep_score': 68},
            {'date': '2025-10-21', 'heart_rate': 76, 'spo2': 98, 'sleep_score': 72},
            {'date': '2025-10-22', 'heart_rate': 80, 'spo2': 96, 'sleep_score': 65},
        ]
        
        health_logs = [
            {'date': '2025-10-20', 'blood_pressure': '138/86', 'glucose': 165, 'notes': 'Feeling tired'},
            {'date': '2025-10-21', 'blood_pressure': '135/84', 'glucose': 158, 'notes': 'Slept poorly'},
        ]
        
        # Generate AI analysis
        analysis = ai_analyzer.analyze_patient_data(patient_data, vital_signs, health_logs)
        
        # Save to database
        ai_analysis = AIAnalyses(
            patient_id=patient_id,
            findings=analysis.get('findings', ''),
            concerns=analysis.get('concerns', []),
            risk_level=analysis.get('risk_level', 'unknown'),
            recommendations=analysis.get('recommendations', ''),
            confidence_score=analysis.get('confidence_score', 0),
            status='pending'
        )
        
        db.session.add(ai_analysis)
        db.session.commit()
        
        return jsonify({
            'message': 'Analysis generated successfully',
            'analysis': analysis,
            'analysis_id': ai_analysis.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@api.route('/ai/proposal', methods=['POST'])
@jwt_required()
def generate_treatment_proposal():
    """Generate treatment proposal"""
    try:
        data = request.get_json()
        
        patient_context = data.get('patient_context', {})
        ai_analysis = data.get('ai_analysis', {})
        
        proposal = ai_analyzer.generate_treatment_proposal(patient_context, ai_analysis)
        
        return jsonify({
            'message': 'Treatment proposal generated',
            'proposal': proposal
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/ai/chat', methods=['POST'])
@jwt_required()
def chat_with_ai():
    """Chat with AI about patient treatment"""
    try:
        data = request.get_json()
        
        conversation_history = data.get('conversation_history', [])
        doctor_message = data.get('message', '')
        
        if not doctor_message:
            return jsonify({'error': 'Message is required'}), 400
        
        ai_response = ai_analyzer.chat_with_doctor(conversation_history, doctor_message)
        
        return jsonify({
            'message': 'AI response generated',
            'ai_response': ai_response
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== DECISION ENDPOINTS ====================

@api.route('/decisions/create', methods=['POST'])
@jwt_required()
def create_decision():
    """Create final collaborative decision"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.role != 'doctor':
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        # Calculate contributions
        contributions = calculate_contributions(
            data.get('ai_contributions', []),
            data.get('doctor_contributions', [])
        )
        
        # Create decision record
        decision = FinalDecisions(
            discussion_id=data.get('discussion_id'),
            patient_id=data.get('patient_id'),
            doctor_id=user.doctor_profile[0].id if user.doctor_profile else None,
            treatment_plan=data.get('treatment_plan', {}),
            medications=data.get('medications', []),
            lifestyle_recommendations=data.get('lifestyle_recommendations', []),
            follow_up_date=data.get('follow_up_date'),
            ai_contribution_percent=contributions['ai_percent'],
            doctor_contribution_percent=contributions['doctor_percent'],
            ai_contributions=data.get('ai_contributions', []),
            doctor_contributions=data.get('doctor_contributions', []),
            decision_confidence=data.get('confidence', 0.85)
        )
        
        db.session.add(decision)
        db.session.commit()
        
        return jsonify({
            'message': 'Decision saved successfully',
            'decision': decision.to_dict(),
            'contributions': contributions
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def calculate_contributions(ai_contributions, doctor_contributions):
    """Calculate contribution percentages"""
    # Simple scoring system
    ai_score = len(ai_contributions) * 10
    doctor_score = len(doctor_contributions) * 10
    
    total_score = ai_score + doctor_score
    
    if total_score == 0:
        return {'ai_percent': 50, 'doctor_percent': 50}
    
    return {
        'ai_percent': round((ai_score / total_score) * 100, 2),
        'doctor_percent': round((doctor_score / total_score) * 100, 2)
    }

@api.route('/decisions/<decision_id>', methods=['GET'])
@jwt_required()
def get_decision(decision_id):
    """Get decision details"""
    try:
        decision = FinalDecisions.query.get(decision_id)
        
        if not decision:
            return jsonify({'error': 'Decision not found'}), 404
        
        return jsonify(decision.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/decisions/patient/<patient_id>', methods=['GET'])
@jwt_required()
def get_patient_decisions(patient_id):
    """Get all decisions for a patient"""
    try:
        decisions = FinalDecisions.query.filter_by(patient_id=patient_id).order_by(
            FinalDecisions.created_at.desc()
        ).all()
        
        return jsonify({
            'decisions': [d.to_dict() for d in decisions]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500