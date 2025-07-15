import os
import bcrypt
from pymongo import MongoClient
from flask_jwt_extended import create_access_token, decode_token
from datetime import datetime, timedelta
from urllib.parse import quote_plus

MONGODB_URI = os.environ.get(
    'MONGODB_URI',
    'mongodb+srv://anishtamakhu98:mlRcNYAsphHWMt38@creditfraud.igftal4.mongodb.net/?retryWrites=true&w=majority&appName=creditfraud'
)
DB_NAME = os.environ.get('MONGO_DB_NAME', 'fraud_detection')

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
users_col = db['users']

class MongoUserManagement:
    def __init__(self):
        self.ensure_demo_users()

    def hash_password(self, password):
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    def check_password(self, password, hashed):
        return bcrypt.checkpw(password.encode(), hashed.encode())

    def register_user(self, username, email, password):
        if users_col.find_one({'email': email}):
            return {'success': False, 'error': 'Email already registered'}
        if users_col.find_one({'username': username}):
            return {'success': False, 'error': 'Username already taken'}
        user = {
            'username': username,
            'email': email,
            'password': self.hash_password(password),
            'role': 'user',
            'created_at': datetime.utcnow()
        }
        users_col.insert_one(user)
        user.pop('password')
        return {'success': True, 'user': user}

    def login_user(self, email, password):
        user = users_col.find_one({'email': email})
        if not user or not self.check_password(password, user['password']):
            return {'success': False, 'error': 'Invalid email or password'}
        access_token = create_access_token(identity={
            'user_id': str(user['_id']),
            'username': user['username'],
            'email': user['email'],
            'role': user.get('role', 'user')
        }, expires_delta=timedelta(hours=24))
        user.pop('password')
        return {'success': True, 'token': access_token, 'user': user}

    def verify_token(self, token):
        try:
            decoded = decode_token(token)
            return decoded['sub']
        except Exception:
            return None

    def get_user_by_id(self, user_id):
        from bson import ObjectId
        user = users_col.find_one({'_id': ObjectId(user_id)})
        if user:
            user.pop('password', None)
            return user
        return None

    def get_all_users(self):
        users = list(users_col.find())
        for u in users:
            u.pop('password', None)
        return users

    def ensure_demo_users(self):
        # Admin
        if not users_col.find_one({'email': 'admin@frauddetection.com'}):
            self.register_user('admin', 'admin@frauddetection.com', 'admin123')
            users_col.update_one({'email': 'admin@frauddetection.com'}, {'$set': {'role': 'admin'}})
        # User
        if not users_col.find_one({'email': 'user@frauddetection.com'}):
            self.register_user('user', 'user@frauddetection.com', 'user123')