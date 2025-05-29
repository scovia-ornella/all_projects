import React from 'react';

const OfflineNotice = ({ onRetry }) => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#faedcd' }}>
      <div className="text-center px-4">
        <div className="max-w-md mx-auto rounded-lg shadow-lg p-8" style={{ backgroundColor: '#5a6c7d' }}>
          {/* Connection Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: '#f59e0b' }}>
              <span className="text-white text-2xl font-bold">!</span>
            </div>
          </div>

          {/* Message */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">
              Backend Server Not Available
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Unable to connect to the SmartPark SIMS backend server. 
              Please ensure the backend server is running.
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Expected backend URL: http://localhost:5000</p>
              <p>Check if the backend server is started</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onRetry}
              className="block w-full py-3 px-4 rounded-md font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#4ade80' }}
            >
              Retry Connection
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="block w-full py-3 px-4 rounded-md font-medium text-gray-300 border border-gray-500 hover:bg-gray-600 transition-colors"
            >
              Refresh Page
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 pt-6 border-t border-gray-600">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
              To start the backend:
            </p>
            <div className="text-xs text-gray-300 space-y-1 text-left">
              <p>1. Open terminal in backend-project folder</p>
              <p>2. Run: npm run dev</p>
              <p>3. Wait for "Backend server running on port 5000"</p>
              <p>4. Refresh this page</p>
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

export default OfflineNotice;
