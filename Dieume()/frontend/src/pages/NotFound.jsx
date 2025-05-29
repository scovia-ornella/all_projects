import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#faedcd' }}>
      <div className="text-center px-4">
        {/* 404 Card */}
        <div className="max-w-md mx-auto rounded-lg shadow-lg p-8" style={{ backgroundColor: '#5a6c7d' }}>
          {/* Large 404 */}
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-white mb-2">404</h1>
            <div className="w-16 h-1 mx-auto" style={{ backgroundColor: '#4ade80' }}></div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">
              Page Not Found
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              The page you are looking for might have been removed, 
              had its name changed, or is temporarily unavailable.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full py-3 px-4 rounded-md font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#4ade80' }}
            >
              Go to Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="block w-full py-3 px-4 rounded-md font-medium text-gray-300 border border-gray-500 hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
          </div>

          {/* Additional Help */}
          <div className="mt-6 pt-6 border-t border-gray-600">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
              Need Help?
            </p>
            <div className="space-y-2">
              <Link
                to="/login"
                className="block text-sm text-gray-300 hover:text-white transition-colors"
              >
                Login to Dashboard
              </Link>
              <a
                href="mailto:support@smartpark.com"
                className="block text-sm text-gray-300 hover:text-white transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: '#023e8a' }}>
            SmartPark Inventory Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
