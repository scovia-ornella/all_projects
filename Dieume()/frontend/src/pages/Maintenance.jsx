import React from 'react';
import { Link } from 'react-router-dom';

const Maintenance = () => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#faedcd' }}>
      <div className="text-center px-4">
        {/* Maintenance Card */}
        <div className="max-w-md mx-auto rounded-lg shadow-lg p-8" style={{ backgroundColor: '#5a6c7d' }}>
          {/* Maintenance Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: '#f59e0b' }}>
              <span className="text-white text-2xl font-bold">⚠</span>
            </div>
          </div>

          {/* Maintenance Message */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">
              System Maintenance
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              We're currently performing scheduled maintenance to improve your experience. 
              The system will be back online shortly.
            </p>
            <p className="text-gray-400 text-xs">
              Estimated completion: 30 minutes
            </p>
          </div>

          {/* Status Updates */}
          <div className="mb-6 p-4 rounded-md" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <h3 className="text-sm font-medium text-yellow-300 mb-2">
              What we're working on:
            </h3>
            <ul className="text-xs text-gray-300 space-y-1 text-left">
              <li>• Database optimization</li>
              <li>• Performance improvements</li>
              <li>• Security updates</li>
              <li>• Bug fixes</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="block w-full py-3 px-4 rounded-md font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#4ade80' }}
            >
              Check Again
            </button>
            
            <Link
              to="/"
              className="block w-full py-3 px-4 rounded-md font-medium text-gray-300 border border-gray-500 hover:bg-gray-600 transition-colors"
            >
              Go to Home
            </Link>
          </div>

          {/* Contact Info */}
          <div className="mt-6 pt-6 border-t border-gray-600">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
              Need Immediate Help?
            </p>
            <div className="space-y-2">
              <a
                href="tel:+250123456789"
                className="block text-sm text-gray-300 hover:text-white transition-colors"
              >
                Emergency: +250 123 456 789
              </a>
              <a
                href="mailto:support@smartpark.com"
                className="block text-sm text-gray-300 hover:text-white transition-colors"
              >
                Email: support@smartpark.com
              </a>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: '#023e8a' }}>
            SmartPark Inventory Management System
          </p>
          <p className="text-xs mt-1" style={{ color: '#023e8a' }}>
            Thank you for your patience
          </p>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
