import React, { useState } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function DataUpload() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setUploadResult(null);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      // For now, just show a success message
      // In a real implementation, you would send this to your backend
      setTimeout(() => {
        setUploadResult({
          success: true,
          message: 'File uploaded successfully!',
          filename: file.name,
          size: file.size
        });
        setIsUploading(false);
        toast.success('File uploaded successfully!');
      }, 2000);

    } catch (error) {
      toast.error('Upload failed: ' + error.message);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Upload className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Data</h1>
          <p className="text-gray-600">
            Upload CSV files for analysis or training
          </p>
        </div>

        {/* File Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          
          <div className="mb-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-700 font-medium">
                Choose a file
              </span>
              <span className="text-gray-500"> or drag and drop</span>
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          
          <p className="text-sm text-gray-500">
            CSV files only, max 10MB
          </p>
        </div>

        {/* Selected File Info */}
        {file && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Upload Button */}
        {file && (
          <div className="mt-6 text-center">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                isUploading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <div className="mt-6">
            {uploadResult.success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800">Upload Successful</h3>
                    <p className="text-sm text-green-700 mt-1">{uploadResult.message}</p>
                    <p className="text-sm text-green-600 mt-1">
                      File: {uploadResult.filename} ({(uploadResult.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Upload Failed</h3>
                    <p className="text-sm text-red-700 mt-1">{uploadResult.message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Information */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Supported File Formats</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• <strong>CSV files</strong> with credit card transaction data</p>
            <p>• Required columns: Transaction Amount, Merchant Category Code, Response Code, Card Type, Transaction Source</p>
            <p>• Maximum file size: 10MB</p>
            <p>• Encoding: UTF-8 recommended</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataUpload;