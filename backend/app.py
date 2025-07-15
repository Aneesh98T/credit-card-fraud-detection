import pandas as pd
import numpy as np
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import joblib
import os
from datetime import datetime
import json
from model_trainer import FraudDetectionModel
from user_management_mongo import MongoUserManagement
import traceback
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

# Global variables
model = None
scaler = None
model_path = 'models/fraud_detection_model.pkl'
scaler_path = 'models/scaler.pkl'
model_trainer = FraudDetectionModel()

# Initialize user management
user_manager = MongoUserManagement()
from pymongo import MongoClient

client = MongoClient("mongodb+srv://anishtamakhu98:password@creditfraud.igftal4.mongodb.net/?retryWrites=true&w=majority&appName=creditfraud")
db = client["mydatabase"]

app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # Change in production
jwt = JWTManager(app)

 
@app.route('/')
def home():
    """Simple home page"""
    return jsonify({
        'message': 'Credit Card Fraud Detection API',
        'status': 'running',
        'endpoints': [
            '/api/health',
            '/api/register',
            '/api/login',
            '/api/user',
            '/api/train-from-csv',
            '/api/predict',
            '/api/model-info',
            '/api/sample-predictions'
        ]
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Credit Card Fraud Detection API is running'})

# User Management Endpoints
@app.route('/api/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not all([username, email, password]):
            return jsonify({'error': 'Username, email, and password are required'}), 400
        
        result = user_manager.register_user(username, email, password)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Login a user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')  # Optional, for demo credentials
        
        if not all([email, password]):
            return jsonify({'error': 'Email and password are required'}), 400

        result = user_manager.login_user(email, password)

        if result['success']:
            return jsonify(result)
        else:
            return jsonify({'error': result['error']}), 401
            return jsonify({'error': result['error']}), 401
            
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@app.route('/api/user', methods=['GET'])
@jwt_required()
def get_user():
    """Get current user info"""
    try:
        identity = get_jwt_identity()
        
        user = user_manager.get_user_by_id(identity['user_id'])
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user})
        
    except Exception as e:
        return jsonify({'error': f'Failed to get user: {str(e)}'}), 500

@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_all_users():
    """Get all users (admin only)"""
    try:
        identity = get_jwt_identity()
        
        if identity['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        users = user_manager.get_all_users()
        return jsonify({'users': users})
        
    except Exception as e:
        return jsonify({'error': f'Failed to get users: {str(e)}'}), 500

@app.route('/api/train-from-csv', methods=['POST'])
def train_from_csv():
    """Train the model using the credit_card_fraud.csv file"""
    try:
        # Check if CSV file exists
        csv_path = 'credit_card_fraud.csv'
        if not os.path.exists(csv_path):
            return jsonify({'error': 'credit_card_fraud.csv file not found in backend directory'}), 404
        
        print("Loading CSV file...")
        # Load your CSV file
        df = pd.read_csv(csv_path)
        print(f"Loaded {len(df)} rows from CSV")
        
        # Check if required columns exist
        required_columns = [
            'Transaction Amount',
            'Merchant Category Code (MCC)',
            'Transaction Response Code',
            'Card Type',
            'Transaction Source',
            'Fraud Flag or Label'
        ]
        
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            return jsonify({
                'error': f'Missing required columns: {missing_columns}',
                'available_columns': list(df.columns)
            }), 400
        
        print("Training model...")
        # Train the model
        trained_model, trained_scaler, metrics = model_trainer.train_model(df)
        
        # Save the model and scaler
        os.makedirs('models', exist_ok=True)
        joblib.dump(trained_model, model_path)
        joblib.dump(trained_scaler, scaler_path)
        
        # Update global variables
        global model, scaler
        model = trained_model
        scaler = trained_scaler
        
        print("Model training completed successfully")
        return jsonify({
            'message': 'Model trained successfully from CSV',
            'metrics': metrics,
            'model_saved': True,
            'dataset_info': {
                'total_rows': len(df),
                'fraud_count': int(df['Fraud Flag or Label'].sum()),
                'fraud_percentage': float(df['Fraud Flag or Label'].mean() * 100)
            }
        })
        
    except Exception as e:
        print("Training error:", str(e))
        print("Full traceback:", traceback.format_exc())
        return jsonify({'error': f'Training failed: {str(e)}'}), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict fraud for credit card transactions"""
    try:
        data = request.get_json()
        
        if not data or 'transactions' not in data:
            return jsonify({'error': 'No transactions data provided'}), 400
        
        # Load model and scaler if not loaded
        global model, scaler
        if model is None or scaler is None:
            if os.path.exists(model_path) and os.path.exists(scaler_path):
                model = joblib.load(model_path)
                scaler = joblib.load(scaler_path)
            else:
                return jsonify({'error': 'Model not trained yet. Please train the model first.'}), 400
        
        # Convert transactions to DataFrame
        transactions_df = pd.DataFrame(data['transactions'])
        
        # Make predictions
        predictions = model_trainer.predict_fraud(transactions_df, model, scaler)
        
        return jsonify({
            'predictions': predictions.tolist(),
            'total_transactions': len(predictions),
            'fraud_count': int(np.sum(predictions)),
            'fraud_percentage': float(np.mean(predictions) * 100)
        })
        
    except Exception as e:
        print("Prediction error:", str(e))
        print("Full traceback:", traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/model-info', methods=['GET'])
def model_info():
    """Get information about the trained model"""
    try:
        if os.path.exists(model_path):
            model = joblib.load(model_path)
            return jsonify({
                'model_exists': True,
                'model_type': type(model).__name__,
                'last_modified': datetime.fromtimestamp(os.path.getmtime(model_path)).isoformat(),
                'model_size_mb': round(os.path.getsize(model_path) / (1024 * 1024), 2)
            })
        else:
            return jsonify({
                'model_exists': False,
                'message': 'No trained model found'
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/sample-predictions', methods=['GET'])
def get_sample_predictions():
    """Get sample transaction data for testing predictions"""
    try:
        # Load a few rows from the CSV for sample predictions
        if os.path.exists('credit_card_fraud.csv'):
            df = pd.read_csv('credit_card_fraud.csv')
            sample_data = df.head(5).to_dict('records')
            
            # Remove the target column for prediction
            for record in sample_data:
                if 'Fraud Flag or Label' in record:
                    del record['Fraud Flag or Label']
            
            return jsonify({
                'sample_transactions': sample_data,
                'message': 'Sample data loaded from CSV'
            })
        else:
            return jsonify({'error': 'CSV file not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dataset-info', methods=['GET'])
def get_dataset_info():
    """Get information about the dataset"""
    try:
        if os.path.exists('credit_card_fraud.csv'):
            df = pd.read_csv('credit_card_fraud.csv')
            return jsonify({
                'total_rows': len(df),
                'columns': list(df.columns),
                'fraud_count': int(df['Fraud Flag or Label'].sum()) if 'Fraud Flag or Label' in df.columns else 0,
                'fraud_percentage': float(df['Fraud Flag or Label'].mean() * 100) if 'Fraud Flag or Label' in df.columns else 0,
                'file_size_mb': round(os.path.getsize('credit_card_fraud.csv') / (1024 * 1024), 2)
            })
        else:
            return jsonify({'error': 'Dataset file not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Credit Card Fraud Detection API...")
    print("Available endpoints:")
    print("- GET  /api/health")
    print("- POST /api/register")
    print("- POST /api/login")
    print("- GET  /api/user")
    print("- POST /api/train-from-csv")
    print("- POST /api/predict")
    print("- GET  /api/model-info")
    print("- GET  /api/sample-predictions")
    print("- GET  /api/dataset-info")
    app.run(debug=True, host='0.0.0.0', port=5000)
