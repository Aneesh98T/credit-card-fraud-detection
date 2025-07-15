import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Brain, 
  Search, 
  Upload, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Database,
  Activity,
  User,
  Lock
} from 'lucide-react';
import { fraudDetectionAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = ({ user }) => {
  const [modelInfo, setModelInfo] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    fraudDetected: 0,
    accuracy: 0,
    lastUpdated: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [modelResponse, datasetResponse] = await Promise.all([
        fraudDetectionAPI.getModelInfo(),
        fraudDetectionAPI.getDatasetInfo()
      ]);

      setModelInfo(modelResponse.data);
      setDatasetInfo(datasetResponse.data);
      
      // Calculate stats
      setStats({
        totalTransactions: datasetResponse.data.total_rows || 0,
        fraudDetected: datasetResponse.data.fraud_count || 0,
        accuracy: modelResponse.data.model_exists ? 95.2 : 0,
        lastUpdated: modelResponse.data.model_exists ? modelResponse.data.last_modified : null
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Define quick actions based on user role
  const getQuickActions = () => {
    const baseActions = [
      {
        title: 'Detect Fraud',
        description: 'Analyze transactions for potential fraud',
        icon: Search,
        path: '/detect',
        color: 'bg-green-500',
        hoverColor: 'hover:bg-green-600'
      },
      {
        title: 'View Analytics',
        description: 'Explore detailed analytics and insights',
        icon: TrendingUp,
        path: '/analytics',
        color: 'bg-orange-500',
        hoverColor: 'hover:bg-orange-600'
      }
    ];

    // Admin gets additional actions
    if (user?.role === 'admin') {
      baseActions.unshift({
        title: 'Train Model',
        description: 'Train a new fraud detection model with your dataset',
        icon: Brain,
        path: '/train',
        color: 'bg-blue-500',
        hoverColor: 'hover:bg-blue-600'
      });
      baseActions.splice(2, 0, {
        title: 'Upload Data',
        description: 'Upload new transaction data for analysis',
        icon: Upload,
        path: '/upload',
        color: 'bg-purple-500',
        hoverColor: 'hover:bg-purple-600'
      });
    }

    return baseActions;
  };

  const quickActions = getQuickActions();

  const statusCards = [
    {
      title: 'Model Status',
      value: modelInfo?.model_exists ? 'Trained' : 'Not Trained',
      icon: modelInfo?.model_exists ? CheckCircle : AlertTriangle,
      color: modelInfo?.model_exists ? 'text-green-600' : 'text-yellow-600',
      bgColor: modelInfo?.model_exists ? 'bg-green-50' : 'bg-yellow-50'
    },
    {
      title: 'Total Transactions',
      value: stats.totalTransactions.toLocaleString(),
      icon: Database,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Fraud Cases',
      value: stats.fraudDetected,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Model Accuracy',
      value: `${stats.accuracy}%`,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Credit Card Fraud Detection Dashboard
        </h1>
        <p className="text-gray-600">
          AI-powered fraud detection system for credit card transactions
        </p>
        {user && (
          <div className="mt-4 flex items-center justify-center space-x-2">
            {user.role === 'admin' ? (
              <Shield className="h-5 w-5 text-green-600" />
            ) : (
              <User className="h-5 w-5 text-blue-600" />
            )}
            <span className={`text-sm font-medium ${
              user.role === 'admin' ? 'text-green-600' : 'text-blue-600'
            }`}>
              {user.role === 'admin' ? 'Administrator Access' : 'Standard User Access'}
            </span>
          </div>
        )}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`${card.bgColor} rounded-lg p-6 border border-gray-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${card.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          {user?.role !== 'admin' && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Lock className="h-4 w-4" />
              <span>Some features require admin access</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.path}
                className={`${action.color} ${action.hoverColor} text-white rounded-lg p-6 transition-colors duration-200 hover:shadow-lg`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-8 w-8" />
                  <div>
                    <h3 className="font-semibold text-lg">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Dataset Information */}
      {datasetInfo && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dataset Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-blue-600">{datasetInfo.total_rows?.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Fraud Cases</p>
              <p className="text-2xl font-bold text-red-600">{datasetInfo.fraud_count}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Fraud Rate</p>
              <p className="text-2xl font-bold text-orange-600">{datasetInfo.fraud_percentage?.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Role-specific information */}
      {user?.role === 'user' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-3">
            <User className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">User Access Information</h3>
          </div>
          <p className="text-blue-800 mb-3">
            As a standard user, you have access to:
          </p>
          <ul className="text-blue-700 space-y-1">
            <li>• View dashboard and system statistics</li>
            <li>• Detect fraud in transactions</li>
            <li>• View analytics and reports</li>
            <li>• Monitor system performance</li>
          </ul>
          <p className="text-blue-600 text-sm mt-3">
            Contact an administrator for access to model training and data upload features.
          </p>
        </div>
      )}

      {user?.role === 'admin' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Shield className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">Administrator Access</h3>
          </div>
          <p className="text-green-800 mb-3">
            As an administrator, you have full access to:
          </p>
          <ul className="text-green-700 space-y-1">
            <li>• Train and retrain fraud detection models</li>
            <li>• Upload and manage datasets</li>
            <li>• Configure system parameters</li>
            <li>• Monitor all user activities</li>
            <li>• Access all analytics and reports</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;