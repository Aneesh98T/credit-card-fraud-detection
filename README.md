# Credit Card Fraud Detection System

A comprehensive fraud detection system with React frontend and Flask backend, featuring user authentication, role-based access control, and MongoDB database integration.

## Features

### 🔐 User Authentication & Authorization
- **MongoDB Database**: Secure user management with MongoDB
- **JWT Authentication**: Token-based authentication system
- **Role-Based Access Control**: User and Admin roles with different permissions
- **User Registration**: New user signup with email validation
- **Secure Password Hashing**: bcrypt password encryption

### 🎯 Fraud Detection
- **Machine Learning Model**: XGBoost-based fraud detection
- **Real-time Predictions**: Instant fraud analysis for transactions
- **Transaction Analytics**: Comprehensive fraud statistics and insights
- **Model Training**: Admin can train models with custom datasets

### 📊 Analytics Dashboard
- **Fraud Statistics**: Real-time fraud detection metrics
- **Transaction Analysis**: Detailed transaction breakdown
- **Visual Charts**: Interactive charts and graphs
- **Export Capabilities**: Download reports and data

### 🛠️ Admin Features
- **Model Management**: Train and update fraud detection models
- **Data Upload**: Upload and process transaction datasets
- **User Management**: View and manage all system users
- **System Monitoring**: Monitor system performance and usage

## Tech Stack

### Frontend
- **React 18**: Modern UI framework
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **React Hot Toast**: Toast notifications
- **Axios**: HTTP client for API calls

### Backend
- **Flask**: Python web framework
- **MongoDB**: NoSQL database for user management
- **PyMongo**: MongoDB driver for Python
- **JWT**: JSON Web Token authentication
- **bcrypt**: Password hashing
- **scikit-learn**: Machine learning library
- **XGBoost**: Gradient boosting for fraud detection
- **pandas**: Data manipulation
- **numpy**: Numerical computing

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB 6.0+

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd credit-card-fraud-detection
```

2. **Install MongoDB**
   - Follow the detailed guide in `setup_mongodb.md`
   - Or run the installation script:
```bash
python install_dependencies.py
```

3. **Install Python dependencies**
```bash
cd backend
pip install -r requirements.txt
```

4. **Install Node.js dependencies**
```bash
cd frontend
npm install
```

5. **Start the application**
```bash
# Terminal 1 - Start backend
cd backend
python app.py

# Terminal 2 - Start frontend
cd frontend
npm start
```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Demo Credentials

The system automatically creates demo users:

### User Account
- **Email**: user@frauddetection.com
- **Password**: user123
- **Role**: User
- **Access**: Fraud detection and analytics

### Admin Account
- **Email**: admin@frauddetection.com
- **Password**: admin123
- **Role**: Admin
- **Access**: Full access including model training and user management

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/user` - Get current user info
- `GET /api/users` - Get all users (admin only)

### Fraud Detection
- `POST /api/train-from-csv` - Train model from CSV
- `POST /api/predict` - Predict fraud for transactions
- `GET /api/model-info` - Get model information
- `GET /api/sample-predictions` - Get sample data
- `GET /api/dataset-info` - Get dataset information

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  created_at: Date,
  last_login: Date
}
```

## Project Structure

```
credit-card-fraud-detection/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── user_management.py     # User authentication & management
│   ├── model_trainer.py       # ML model training
│   ├── requirements.txt       # Python dependencies
│   └── models/               # Trained model files
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── App.js          # Main app component
│   ├── package.json         # Node.js dependencies
│   └── public/             # Static files
├── setup_mongodb.md         # MongoDB setup guide
├── install_dependencies.py  # Dependency installation script
└── README.md               # This file
```

## Security Features

- **Password Hashing**: bcrypt for secure password storage
- **JWT Tokens**: Secure authentication tokens
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Cross-origin resource sharing protection
- **Error Handling**: Comprehensive error handling and logging

## Development

### Backend Development
```bash
cd backend
python app.py
```

### Frontend Development
```bash
cd frontend
npm start
```

### Database Management
```bash
# Connect to MongoDB
mongosh

# Switch to database
use fraud_detection

# View users
db.users.find()
```

## Deployment

### Environment Variables
Create a `.env` file in the backend directory:
```bash
JWT_SECRET_KEY=your-super-secret-key
MONGODB_URI=mongodb://localhost:27017/fraud_detection
```

### Production Considerations
1. Use HTTPS in production
2. Set strong JWT secret keys
3. Enable MongoDB authentication
4. Use environment variables for sensitive data
5. Implement rate limiting
6. Set up regular database backups

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
1. Check the `setup_mongodb.md` guide
2. Review the API documentation
3. Check the troubleshooting section in the setup guide 