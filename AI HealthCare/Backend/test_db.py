import psycopg
from dotenv import load_dotenv
import os

load_dotenv()

def test_database_connection():
    try:
        db_url = os.getenv('DATABASE_URL')
        
        # Remove the +psycopg part for direct connection
        connection_string = db_url.replace('postgresql+psycopg://', 'postgresql://')
        
        print(f"Connecting to database...")
        
        conn = psycopg.connect(connection_string)
        cursor = conn.cursor()
        
        cursor.execute("SELECT version();")
        db_version = cursor.fetchone()
        print("Database connection successful!")
        print(f"PostgreSQL version: {db_version[0][:50]}...")
        
        cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
        table_count = cursor.fetchone()[0]
        print(f"Found {table_count} tables")
        
        cursor.execute("SELECT COUNT(*) FROM users;")
        user_count = cursor.fetchone()[0]
        print(f"Found {user_count} users")
        
        cursor.close()
        conn.close()
        print("\nDatabase setup complete!")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_database_connection()