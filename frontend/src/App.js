import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ModelTraining from './pages/ModelTraining';
import FraudDetection from './pages/FraudDetection';
import DataUpload from './pages/DataUpload';
import Analytics from './pages/Analytics';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [users, setUsers] = useState([]); // Store created users

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('fraudDetectionUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('fraudDetectionUser', JSON.stringify(userData));
  };

  const handleSignup = (userData) => {
    // Add new user to users list
    setUsers(prev => [...prev, userData]);
    
    // Auto-login the new user
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('fraudDetectionUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('fraudDetectionUser');
  };

  const switchToSignup = () => {
    setShowSignup(true);
  };

  const switchToLogin = () => {
    setShowSignup(false);
  };

  // Show login/signup page if not authenticated
  if (!isAuthenticated) {
    if (showSignup) {
      return <Signup onSignup={handleSignup} onSwitchToLogin={switchToLogin} />;
    } else {
      return <Login onLogin={handleLogin} onSwitchToSignup={switchToSignup} />;
    }
  }

  // Show main app if authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public routes (accessible to all authenticated users) */}
          <Route path="/" element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} />
            </ProtectedRoute>
          } />
          <Route path="/detect" element={
            <ProtectedRoute user={user}>
              <FraudDetection />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute user={user}>
              <Analytics />
            </ProtectedRoute>
          } />
          
          {/* Admin-only routes */}
          <Route path="/train" element={
            <ProtectedRoute user={user} requiredRole="admin">
              <ModelTraining />
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute user={user} requiredRole="admin">
              <DataUpload />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App; 