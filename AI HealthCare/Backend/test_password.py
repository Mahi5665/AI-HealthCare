from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

# The password you want to test
password = "password123"

# The hash from database
stored_hash = "$2b$12$e5mFJzzpWq1u6pZt8JhVxeT3u2IuWf2hMIK7z6Jr3gUpyDlkY6Y1i"

# Test if they match
result = bcrypt.check_password_hash(stored_hash, password)
print(f"Password match: {result}")

# Generate a new hash to be sure
new_hash = bcrypt.generate_password_hash(password).decode('utf-8')
print(f"\nNew hash for 'password123': {new_hash}")