from flask_bcrypt import Bcrypt
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

bcrypt = Bcrypt()

# Generate password hash for "password123"
password_hash = bcrypt.generate_password_hash("password123").decode('utf-8')
print(f"Generated hash: {password_hash[:50]}...")

# Connect to database
try:
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    cursor = conn.cursor()
    
    # Update existing users with correct emails from your database
    cursor.execute("""
        UPDATE users 
        SET password_hash = %s 
        WHERE email IN ('patient@aihealthcare.com', 'doctor@aihealthcare.com')
    """, (password_hash,))
    
    rows_updated = cursor.rowcount
    conn.commit()
    
    if rows_updated > 0:
        print(f"✅ Updated {rows_updated} demo user(s) with password: password123")
    else:
        print("⚠️ No users found to update. Creating new demo users...")
        
        # Create patient user
        cursor.execute("""
            INSERT INTO users (email, password_hash, role, first_name, last_name)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, ('patient@vitalloop.com', password_hash, 'patient', 'John', 'Doe'))
        
        patient_user_id = cursor.fetchone()[0]
        
        # Create patient profile
        cursor.execute("""
            INSERT INTO patients (user_id, date_of_birth, gender, blood_type)
            VALUES (%s, %s, %s, %s)
        """, (patient_user_id, '1990-01-15', 'Male', 'O+'))
        
        # Create doctor user
        cursor.execute("""
            INSERT INTO users (email, password_hash, role, first_name, last_name)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, ('doctor@vitalloop.com', password_hash, 'doctor', 'Sarah', 'Smith'))
        
        doctor_user_id = cursor.fetchone()[0]
        
        # Create doctor profile
        cursor.execute("""
            INSERT INTO doctors (user_id, license_number, specialization, years_of_experience)
            VALUES (%s, %s, %s, %s)
        """, (doctor_user_id, 'MD-12345', 'Internal Medicine', 10))
        
        conn.commit()
        print("✅ Created new demo users!")
    
    # Verify users
    cursor.execute("""
        SELECT email, role, first_name, last_name 
        FROM users 
        WHERE email IN ('patient@aihealthcare.com', 'doctor@aihealthcare.com', 
                       'patient@vitalloop.com', 'doctor@vitalloop.com')
    """)
    users = cursor.fetchall()
    
    print("\n📋 Demo users ready:")
    for user in users:
        print(f"  - Email: {user[0]}")
        print(f"    Role: {user[1]}")
        print(f"    Name: {user[2]} {user[3]}")
        print(f"    Password: password123")
        print()
    
    cursor.close()
    conn.close()
    
    print("✅ All done! You can now login with these credentials")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")