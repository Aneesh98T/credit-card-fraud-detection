import json
import os
import hashlib
import jwt
import time
from datetime import datetime, timedelta

USERS_FILE = os.path.join(os.path.dirname(__file__), 'users.json')
SECRET_KEY = 'super-secret-key'  # Change this in production
TOKEN_EXPIRY_HOURS = 24

class FileUserManagement:
    def __init__(self):
        self.users = self.load_users()

    def load_users(self):
        if not os.path.exists(USERS_FILE):
            return []
        with open(USERS_FILE, 'r') as f:
            try:
                return json.load(f)
            except Exception:
                return []

    def save_users(self):
        with open(USERS_FILE, 'w') as f:
            json.dump(self.users, f, indent=2)

    def hash_password(self, password):
        return hashlib.sha256(password.encode()).hexdigest()

    def register_user(self, username, email, password):
        if any(u['email'] == email for u in self.users):
            return {'success': False, 'error': 'Email already registered'}
        if any(u['username'] == username for u in self.users):
            return {'success': False, 'error': 'Username already taken'}
        user = {
            'id': str(int(time.time() * 1000)),
            'username': username,
            'email': email,
            'password': self.hash_password(password),
            'role': 'user',
            'created_at': datetime.utcnow().isoformat()
        }
        self.users.append(user)
        self.save_users()
        return {'success': True, 'user': {k: v for k, v in user.items() if k != 'password'}}

    def login_user(self, email, password):
        user = next((u for u in self.users if u['email'] == email), None)
        if not user or user['password'] != self.hash_password(password):
            return {'success': False, 'error': 'Invalid email or password'}
        token = self.generate_token(user)
        return {'success': True, 'token': token, 'user': {k: v for k, v in user.items() if k != 'password'}}

    def generate_token(self, user):
        payload = {
            'user_id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'role': user.get('role', 'user'),
            'exp': datetime.utcnow() + timedelta(hours=TOKEN_EXPIRY_HOURS)
        }
        return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

    def verify_token(self, token):
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            return payload
        except Exception:
            return None

    def get_user_by_id(self, user_id):
        user = next((u for u in self.users if u['id'] == user_id), None)
        if user:
            return {k: v for k, v in user.items() if k != 'password'}
        return None

    def get_all_users(self):
        return [{k: v for k, v in u.items() if k != 'password'} for u in self.users]

# Optionally, create a default admin user if none exists
def ensure_admin():
    mgr = FileUserManagement()
    if not any(u['role'] == 'admin' for u in mgr.users):
        mgr.register_user('admin', 'admin@example.com', 'admin123')
        mgr.users[-1]['role'] = 'admin'
        mgr.save_users()

def ensure_demo_users():
    mgr = FileUserManagement()
    # Ensure admin
    if not any(u['email'] == 'admin@frauddetection.com' for u in mgr.users):
        mgr.register_user('admin', 'admin@frauddetection.com', 'admin123')
        mgr.users[-1]['role'] = 'admin'
        mgr.save_users()
    # Ensure demo user
    if not any(u['email'] == 'user@frauddetection.com' for u in mgr.users):
        mgr.register_user('user', 'user@frauddetection.com', 'user123')
        mgr.save_users()

ensure_admin()
ensure_demo_users() 