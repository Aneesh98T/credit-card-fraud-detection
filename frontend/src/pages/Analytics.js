import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { fraudDetectionAPI } from '../services/api';

function Analytics() {
  const [modelInfo, setModelInfo] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const [modelResponse, datasetResponse] = await Promise.all([
        fraudDetectionAPI.getModelInfo(),
        fraudDetectionAPI.getDatasetInfo()
      ]);

      setModelInfo(modelResponse.data);
      setDatasetInfo(datasetResponse.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6">
      <div className="text-center mb-8">
        <BarChart3 className="h-16 w-16 text-purple-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">
          Insights and metrics for your fraud detection system
        </p>
      </div>

      {/* Model Performance Metrics */}
      {modelInfo?.model_exists && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Model Status</p>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Model Type</p>
                <p className="text-2xl font-bold text-blue-600">{modelInfo.model_type}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Model Size</p>
                <p className="text-2xl font-bold text-purple-600">{modelInfo.model_size_mb} MB</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-lg font-bold text-orange-600">
                  {new Date(modelInfo.last_modified).toLocaleDateString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Dataset Analytics */}
      {datasetInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Dataset Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Dataset Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Records</span>
                <span className="font-semibold">{datasetInfo.total_rows?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fraud Cases</span>
                <span className="font-semibold text-red-600">{datasetInfo.fraud_count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Legitimate Cases</span>
                <span className="font-semibold text-green-600">
                  {datasetInfo.total_rows - datasetInfo.fraud_count}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fraud Rate</span>
                <span className="font-semibold text-orange-600">
                  {datasetInfo.fraud_percentage?.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">File Size</span>
                <span className="font-semibold">{datasetInfo.file_size_mb} MB</span>
              </div>
            </div>
          </div>

          {/* Fraud Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Fraud Distribution</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-600">Legitimate Transactions</span>
                <span className="ml-auto font-semibold">
                  {((datasetInfo.total_rows - datasetInfo.fraud_count) / datasetInfo.total_rows * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-600">Fraudulent Transactions</span>
                <span className="ml-auto font-semibold">
                  {datasetInfo.fraud_percentage?.toFixed(1)}%
                </span>
              </div>
              
              {/* Simple Bar Chart */}
              <div className="mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-green-500 h-4 rounded-full" 
                      style={{ width: `${100 - datasetInfo.fraud_percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">Legitimate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-red-500 h-4 rounded-full" 
                      style={{ width: `${datasetInfo.fraud_percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">Fraud</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Feature Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Transaction Amount</h3>
            <p className="text-sm text-gray-600">
              Key indicator for fraud detection. High amounts may indicate suspicious activity.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Merchant Category Code</h3>
            <p className="text-sm text-gray-600">
              Different merchant types have varying fraud risk levels.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Transaction Response Code</h3>
            <p className="text-sm text-gray-600">
              System response codes can indicate transaction validity.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Card Type</h3>
            <p className="text-sm text-gray-600">
              Different card types may have different fraud patterns.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Transaction Source</h3>
            <p className="text-sm text-gray-600">
              Source of transaction (online, in-store, etc.) affects fraud risk.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Fraud Flag</h3>
            <p className="text-sm text-gray-600">
              Target variable indicating whether transaction was fraudulent.
            </p>
          </div>
        </div>
      </div>

      {/* System Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">System Insights</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <p>• <strong>Imbalanced Dataset:</strong> Fraud cases are typically rare, requiring special handling</p>
            <p>• <strong>Feature Engineering:</strong> Multiple features are used to detect patterns</p>
            <p>• <strong>Model Selection:</strong> Multiple algorithms are tested to find the best performer</p>
            <p>• <strong>Real-time Detection:</strong> System can analyze transactions in real-time</p>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-green-900 mb-3">Best Practices</h3>
          <div className="space-y-3 text-sm text-green-800">
            <p>• <strong>Regular Training:</strong> Retrain models with new data periodically</p>
            <p>• <strong>Feature Monitoring:</strong> Track feature importance and drift</p>
            <p>• <strong>Performance Metrics:</strong> Monitor accuracy, precision, recall, and F1-score</p>
            <p>• <strong>Data Quality:</strong> Ensure clean and consistent data for better results</p>
          </div>
        </div>
      </div>

      {/* No Model Warning */}
      {!modelInfo?.model_exists && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800">No Trained Model</h3>
              <p className="text-yellow-700 mt-1">
                Train a model first to see detailed analytics and performance metrics.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;