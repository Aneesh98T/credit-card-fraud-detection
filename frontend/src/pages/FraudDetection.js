import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, AlertTriangle, CheckCircle, Loader, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

function FraudDetection() {
  const [transactions, setTransactions] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modelExists, setModelExists] = useState(false);
  const [sampleData, setSampleData] = useState([]);

  useEffect(() => {
    checkModelStatus();
    loadSampleData();
  }, []);

  const checkModelStatus = async () => {
    try {
      const response = await axios.get('/api/model-info');
      setModelExists(response.data.model_exists);
    } catch (error) {
      console.error('Error checking model status:', error);
    }
  };

  const loadSampleData = async () => {
    try {
      const response = await axios.get('/api/sample-predictions');
      setSampleData(response.data.sample_transactions || []);
    } catch (error) {
      console.error('Error loading sample data:', error);
    }
  };

  const handleTransactionChange = (index, field, value) => {
    const updatedTransactions = [...transactions];
    updatedTransactions[index] = {
      ...updatedTransactions[index],
      [field]: value
    };
    setTransactions(updatedTransactions);
  };

  const addTransaction = () => {
    setTransactions([
      ...transactions,
      {
        'Transaction Date and Time': '',
        'Transaction Amount': '',
        'Card Number': '',
        'Card Expiration Date': '',
        'CVV Code': '',
        'Card Type': '',
        'Transaction Source': '',
        'Transaction ID': ''
      }
    ]);
  };

  const removeTransaction = (index) => {
    const updatedTransactions = transactions.filter((_, i) => i !== index);
    setTransactions(updatedTransactions);
  };

  const predictFraud = async () => {
    if (transactions.length === 0) {
      toast.error('Please add at least one transaction');
      return;
    }

    // Validate transactions
    const validTransactions = transactions.filter(t => 
      t['Transaction Date and Time'] && 
      t['Transaction Amount'] && 
      t['Card Number'] && 
      t['Card Expiration Date'] && 
      t['CVV Code'] && 
      t['Card Type'] && 
      t['Transaction Source'] && 
      t['Transaction ID']
    );

    if (validTransactions.length === 0) {
      toast.error('Please fill in all fields for at least one transaction');
      return;
    }

    try {
      setIsLoading(true);
      
      // Convert to format expected by backend (using dummy values for required fields)
      const backendTransactions = validTransactions.map(t => ({
        'Transaction Amount': parseFloat(t['Transaction Amount']),
        'Merchant Category Code (MCC)': 5411, // Default grocery store code
        'Transaction Response Code': 0, // Default success code
        'Card Type': t['Card Type'],
        'Transaction Source': t['Transaction Source']
      }));

      const response = await axios.post('/api/predict', {
        transactions: backendTransactions
      });

      setPredictions(response.data.predictions);
      toast.success(`Analysis complete! Found ${response.data.fraud_count} potential fraud cases.`);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Prediction failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setTransactions([]);
    setPredictions([]);
  };

  if (!modelExists) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Model Not Trained</h2>
          <p className="text-yellow-700 mb-4">
            You need to train a model before you can detect fraud. Please go to the Train Model page first.
          </p>
          <a 
            href="/train" 
            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Go to Train Model
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Search className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fraud Detection</h1>
          <p className="text-gray-600">
            Analyze credit card transactions for potential fraud
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={addTransaction}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Transaction
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Clear All
          </button>
        </div>

        {/* Transactions Form */}
        {transactions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Transactions</h2>
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">Transaction {index + 1}</h3>
                    <button
                      onClick={() => removeTransaction(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transaction Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={transaction['Transaction Date and Time'] || ''}
                        onChange={(e) => handleTransactionChange(index, 'Transaction Date and Time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transaction Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={transaction['Transaction Amount'] || ''}
                        onChange={(e) => handleTransactionChange(index, 'Transaction Amount', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={transaction['Card Number'] || ''}
                        onChange={(e) => handleTransactionChange(index, 'Card Number', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1234-5678-9012-3456"
                        maxLength="19"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiration Date
                      </label>
                      <input
                        type="text"
                        value={transaction['Card Expiration Date'] || ''}
                        onChange={(e) => handleTransactionChange(index, 'Card Expiration Date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV Code
                      </label>
                      <input
                        type="text"
                        value={transaction['CVV Code'] || ''}
                        onChange={(e) => handleTransactionChange(index, 'CVV Code', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="123"
                        maxLength="4"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Type
                      </label>
                      <select
                        value={transaction['Card Type'] || ''}
                        onChange={(e) => handleTransactionChange(index, 'Card Type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Card Type</option>
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="American Express">American Express</option>
                        <option value="Discover">Discover</option>
                        <option value="Diners Club">Diners Club</option>
                        <option value="JCB">JCB</option>
                        <option value="UnionPay">UnionPay</option>
                        <option value="Maestro">Maestro</option>
                        <option value="Visa Electron">Visa Electron</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transaction Source
                      </label>
                      <select
                        value={transaction['Transaction Source'] || ''}
                        onChange={(e) => handleTransactionChange(index, 'Transaction Source', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Source</option>
                        <option value="Online">Online</option>
                        <option value="In-Store">In-Store</option>
                        <option value="ATM">ATM</option>
                        <option value="Mobile">Mobile</option>
                        <option value="Phone">Phone</option>
                        <option value="Mail Order">Mail Order</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transaction ID
                      </label>
                      <input
                        type="text"
                        value={transaction['Transaction ID'] || ''}
                        onChange={(e) => handleTransactionChange(index, 'Transaction ID', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="TXN-2024-001"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Predict Button */}
        {transactions.length > 0 && (
          <div className="text-center mb-6">
            <button
              onClick={predictFraud}
              disabled={isLoading}
              className={`px-8 py-3 rounded-lg font-medium text-white transition-colors ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Analyzing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Detect Fraud</span>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {predictions.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis Results</h2>
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Transaction {index + 1}</h3>
                      <p className="text-sm text-gray-600">
                        Date: {transaction['Transaction Date and Time']} | 
                        Amount: ${transaction['Transaction Amount']} | 
                        Card: {transaction['Card Type']} | 
                        Source: {transaction['Transaction Source']} | 
                        ID: {transaction['Transaction ID']}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {predictions[index] ? (
                        <>
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <span className="text-red-600 font-medium">FRAUD DETECTED</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-green-600 font-medium">LEGITIMATE</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">How to use</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• Click "Add Transaction" to add a new transaction for analysis</p>
            <p>• Fill in all the required fields for each transaction</p>
            <p>• Enter realistic transaction data including card details and timestamps</p>
            <p>• Click "Detect Fraud" to analyze all transactions</p>
            <p>• The system will classify each transaction as legitimate or fraudulent</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FraudDetection;