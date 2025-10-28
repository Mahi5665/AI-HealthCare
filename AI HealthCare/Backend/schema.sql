-- AI HealthCare Database Schema
-- Created: October 2025

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (Patients, Doctors, Admins)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- PATIENTS TABLE
-- ============================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    blood_type VARCHAR(5),
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    allergies TEXT[],
    chronic_conditions TEXT[],
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    wearable_device_id VARCHAR(100),
    device_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_user_id ON patients(user_id);

-- ============================================
-- DOCTORS TABLE
-- ============================================
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(50) UNIQUE,
    specialization VARCHAR(100),
    years_of_experience INTEGER,
    hospital_affiliation VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doctors_user_id ON doctors(user_id);

-- ============================================
-- WEARABLE DATA TABLE (Smart Ring Data)
-- ============================================
CREATE TABLE wearable_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP NOT NULL,
    heart_rate INTEGER,
    heart_rate_variability INTEGER,
    spo2 INTEGER,
    temperature DECIMAL(4,2),
    respiratory_rate INTEGER,
    steps INTEGER,
    calories_burned INTEGER,
    sleep_duration_minutes INTEGER,
    deep_sleep_minutes INTEGER,
    rem_sleep_minutes INTEGER,
    sleep_score INTEGER,
    activity_level INTEGER,
    stress_score INTEGER,
    readiness_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wearable_patient_time ON wearable_data(patient_id, recorded_at DESC);
CREATE INDEX idx_wearable_recorded_at ON wearable_data(recorded_at DESC);

-- ============================================
-- HEALTH LOGS TABLE (Manual Entry)
-- ============================================
CREATE TABLE health_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    glucose_mg_dl INTEGER,
    weight_kg DECIMAL(5,2),
    symptoms TEXT[],
    symptom_severity INTEGER CHECK (symptom_severity BETWEEN 1 AND 10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_logs_patient_date ON health_logs(patient_id, log_date DESC);

-- ============================================
-- AI ANALYSES TABLE
-- ============================================
CREATE TABLE ai_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_analyzed JSONB,
    findings TEXT,
    concerns TEXT[],
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
    confidence_score DECIMAL(3,2),
    recommendations TEXT,
    evidence_sources JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved'))
);

CREATE INDEX idx_ai_analyses_patient ON ai_analyses(patient_id, analysis_timestamp DESC);
CREATE INDEX idx_ai_analyses_status ON ai_analyses(status);

-- ============================================
-- COLLABORATIVE DISCUSSIONS TABLE
-- ============================================
CREATE TABLE collaborative_discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    ai_analysis_id UUID REFERENCES ai_analyses(id),
    topic VARCHAR(255),
    status VARCHAR(30) DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'consensus_reached', 'doctor_final_decision')),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    concluded_at TIMESTAMP
);

CREATE INDEX idx_discussions_patient ON collaborative_discussions(patient_id);
CREATE INDEX idx_discussions_doctor ON collaborative_discussions(doctor_id);
CREATE INDEX idx_discussions_status ON collaborative_discussions(status);

-- ============================================
-- DISCUSSION MESSAGES TABLE
-- ============================================
CREATE TABLE discussion_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discussion_id UUID REFERENCES collaborative_discussions(id) ON DELETE CASCADE,
    speaker VARCHAR(10) CHECK (speaker IN ('ai', 'doctor')),
    message_order INTEGER NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(30) CHECK (message_type IN ('proposal', 'concern', 'question', 'agreement', 'counter_proposal', 'acknowledgment')),
    structured_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_discussion ON discussion_messages(discussion_id, message_order);

-- ============================================
-- FINAL DECISIONS TABLE
-- ============================================
CREATE TABLE final_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discussion_id UUID REFERENCES collaborative_discussions(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id),
    doctor_id UUID REFERENCES doctors(id),
    treatment_plan JSONB NOT NULL,
    medications JSONB,
    lifestyle_recommendations JSONB,
    follow_up_date DATE,
    ai_contribution_percent DECIMAL(5,2),
    doctor_contribution_percent DECIMAL(5,2),
    ai_contributions TEXT[],
    doctor_contributions TEXT[],
    decision_confidence DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_decisions_patient ON final_decisions(patient_id, created_at DESC);
CREATE INDEX idx_decisions_doctor ON final_decisions(doctor_id, created_at DESC);

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Insert a test doctor
INSERT INTO users (email, password_hash, role, first_name, last_name) 
VALUES ('doctor@aihealthcare.com', '$2b$12$placeholder', 'doctor', 'Sarah', 'Chen');

INSERT INTO doctors (user_id, license_number, specialization, years_of_experience)
SELECT id, 'MD-12345', 'Internal Medicine', 10 
FROM users WHERE email = 'doctor@aihealthcare.com';

-- Insert a test patient
INSERT INTO users (email, password_hash, role, first_name, last_name) 
VALUES ('patient@aihealthcare.com', '$2b$12$placeholder', 'patient', 'John', 'Smith');

INSERT INTO patients (user_id, date_of_birth, gender, blood_type)
SELECT id, '1975-05-15', 'Male', 'O+' 
FROM users WHERE email = 'patient@aihealthcare.com';

-- Success message
SELECT 'Database schema created successfully!' AS message;
SELECT 'Total tables created: ' || COUNT(*) AS summary
FROM information_schema.tables 
WHERE table_schema = 'public';