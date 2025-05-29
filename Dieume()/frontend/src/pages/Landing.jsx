import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header style={{ backgroundColor: '#023e8a' }} className="text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">SmartPark SIMS</h1>
            <div className="space-x-4">
              <Link
                to="/login"
                className="btn-primary px-4 py-2"
              >
                Login / Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ color: '#023e8a' }}>
            Inventory Management System
          </h2>
          <p className="text-xl mb-8" style={{ color: '#023e8a' }}>
            Streamline your spare parts inventory with our comprehensive management solution
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-4">Spare Parts Management</h3>
              <p className="text-gray-600">
                Add and organize your spare parts inventory with detailed categorization and pricing.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-4">Stock Tracking</h3>
              <p className="text-gray-600">
                Monitor incoming and outgoing stock movements with real-time quantity updates.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-4">Comprehensive Reports</h3>
              <p className="text-gray-600">
                Generate detailed reports for daily operations and stock status analysis.
              </p>
            </div>
          </div>

          <div className="space-x-4">
            <Link
              to="/login"
              className="btn-primary px-8 py-3 text-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#023e8a' }} className="text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 SmartPark SIMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
