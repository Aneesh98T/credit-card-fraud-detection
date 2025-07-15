import React from 'react';
import { Navigate } from 'react-router-dom';
import { AlertTriangle, Shield } from 'lucide-react';

function ProtectedRoute({ children, requiredRole = null, user }) {
  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and user doesn't have it
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-700 mb-4">
            You don't have permission to access this page. This feature is only available to administrators.
          </p>
          <div className="text-sm text-red-600">
            <p>Current role: <span className="font-medium">{user.role}</span></p>
            <p>Required role: <span className="font-medium">{requiredRole}</span></p>
          </div>
        </div>
      </div>
    );
  }

  // If all checks pass, render the children
  return children;
}

export default ProtectedRoute; 