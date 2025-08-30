from pymongo import MongoClient
from bson import ObjectId
import bcrypt
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB Atlas connection
client = MongoClient(os.environ.get('MONGO_ATLAS_URI', 'mongodb://localhost:27017/'))
db = client['memory_db']
users_collection = db['users']

def register_user(email, password, name):
    """Register a new user"""
    try:
        # Check if user already exists
        if users_collection.find_one({'email': email}):
            return {'error': 'User already exists with this email'}
        
        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Create user document
        user = {
            'email': email,
            'password': hashed_password,
            'name': name,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        # Insert user
        result = users_collection.insert_one(user)
        
        return {
            'user_id': str(result.inserted_id),
            'email': email,
            'name': name
        }
        
    except Exception as e:
        return {'error': f'Registration failed: {str(e)}'}

def login_user(email, password):
    """Authenticate user login"""
    try:
        # Find user by email
        user = users_collection.find_one({'email': email})
        
        if not user:
            return {'error': 'Invalid email or password'}
        
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return {'error': 'Invalid email or password'}
        
        return {
            'user_id': str(user['_id']),
            'email': user['email'],
            'name': user.get('name', '')
        }
        
    except Exception as e:
        return {'error': f'Login failed: {str(e)}'}

def get_user_by_id(user_id):
    """Get user by ID"""
    try:
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        if user:
            user['_id'] = str(user['_id'])  # Convert ObjectId to string
        return user
    except:
        return None