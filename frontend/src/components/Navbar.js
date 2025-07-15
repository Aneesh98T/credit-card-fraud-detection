import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, ChevronDown, Shield } from 'lucide-react';

function Navbar({ user, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Define navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { path: '/', label: 'Dashboard' },
      { path: '/detect', label: 'Detect Fraud' },
      { path: '/analytics', label: 'Analytics' }
    ];

    // Admin gets additional items
    if (user?.role === 'admin') {
      baseItems.splice(1, 0, { path: '/train', label: 'Train Model' });
      baseItems.splice(3, 0, { path: '/upload', label: 'Upload Data' });
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-800">
            Fraud Detection System
          </Link>
          
          <div className="flex items-center space-x-4">
            {navigationItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className="text-gray-600 hover:text-gray-800"
              >
                {item.label}
              </Link>
            ))}
            
            {/* User Menu */}
            {user && (
              <div className="relative ml-4">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    user.role === 'admin' ? 'bg-green-600' : 'bg-blue-600'
                  }`}>
                    {user.role === 'admin' ? (
                      <Shield className="h-4 w-4 text-white" />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-gray-500">{user.email}</p>
                      <p className={`text-xs mt-1 ${
                        user.role === 'admin' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {user.role === 'admin' ? 'Administrator' : 'Standard User'}
                      </p>
                    </div>
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Backdrop for mobile menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
}

export default Navbar;