import React, { useState } from 'react';
import axios from 'axios';
import { Brain, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

function ModelTraining() {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingResult, setTrainingResult] = useState(null);
  const [error, setError] = useState(null);

  const trainFromCSV = async () => {
    try {
      setIsTraining(true);
      setError(null);
      setTrainingResult(null);

      toast.loading('Training model...', { id: 'training' });

      const response = await axios.post('/api/train-from-csv');
      
      toast.success('Model trained successfully!', { id: 'training' });
      
      setTrainingResult(response.data);
      
      // Refresh the page after a short delay to update dashboard
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Training failed';
      toast.error(`Error: ${errorMessage}`, { id: 'training' });
      setError(errorMessage);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Train Fraud Detection Model</h1>
          <p className="text-gray-600">
            Train a machine learning model using your credit card fraud dataset
          </p>
        </div>

        {/* Training Section */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Model Training</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">
                Using dataset: <strong>credit_card_fraud.csv</strong>
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">
                Features: Transaction Amount, Merchant Category, Response Code, Card Type, Transaction Source
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">
                Target: Fraud Flag or Label
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button 
              onClick={trainFromCSV}
              disabled={isTraining}
              className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isTraining 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isTraining ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Training Model...</span>
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  <span>Train Model from CSV</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Training Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Training Results */}
        {trainingResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-medium text-green-800">Training Successful!</h3>
                <p className="text-sm text-green-700">Model has been trained and saved successfully.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="text-2xl font-bold text-green-600">
                  {(trainingResult.metrics?.accuracy * 100).toFixed(2)}%
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600">Precision</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(trainingResult.metrics?.precision * 100).toFixed(2)}%
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600">Recall</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(trainingResult.metrics?.recall * 100).toFixed(2)}%
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600">F1 Score</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(trainingResult.metrics?.f1_score * 100).toFixed(2)}%
                </p>
              </div>
            </div>

            {trainingResult.dataset_info && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <h4 className="text-sm font-medium text-green-800 mb-2">Dataset Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Records:</span>
                    <span className="ml-2 font-medium">{trainingResult.dataset_info.total_rows?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fraud Cases:</span>
                    <span className="ml-2 font-medium">{trainingResult.dataset_info.fraud_count}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fraud Rate:</span>
                    <span className="ml-2 font-medium">{trainingResult.dataset_info.fraud_percentage?.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Information Section */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">What happens during training?</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• The system loads your credit card fraud dataset</p>
            <p>• Preprocesses the data (handles missing values, encodes categorical variables)</p>
            <p>• Trains multiple models (Random Forest, XGBoost, Logistic Regression)</p>
            <p>• Selects the best performing model based on F1 score</p>
            <p>• Saves the trained model for future predictions</p>
            <p>• Provides detailed performance metrics</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelTraining;