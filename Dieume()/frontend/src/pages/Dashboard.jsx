import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sparePartsAPI, stockOutAPI, reportsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalSpareParts: 0,
    totalStockValue: 0,
    lowStockItems: 0,
    recentStockOuts: [],
    topCategories: [],
    monthlyStats: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Initialize with empty arrays to prevent errors
      let spareParts = [];
      let stockOuts = [];

      // Fetch spare parts with error handling
      try {
        const sparePartsResponse = await sparePartsAPI.getAll();
        spareParts = sparePartsResponse.data.success ? sparePartsResponse.data.data : [];
      } catch (error) {
        console.log('Could not fetch spare parts:', error.message);
      }

      // Fetch recent stock outs with error handling
      try {
        const stockOutResponse = await stockOutAPI.getAll();
        stockOuts = stockOutResponse.data.success ? stockOutResponse.data.data : [];
      } catch (error) {
        console.log('Could not fetch stock outs:', error.message);
      }

      // Calculate statistics
      const totalSpareParts = spareParts.length;
      const totalStockValue = spareParts.reduce((sum, part) => sum + (part.quantity * part.unit_price), 0);
      const lowStockItems = spareParts.filter(part => part.quantity <= 5).length;
      const recentStockOuts = stockOuts.slice(0, 5);

      // Calculate top categories
      const categoryStats = {};
      spareParts.forEach(part => {
        if (!categoryStats[part.category]) {
          categoryStats[part.category] = { count: 0, value: 0 };
        }
        categoryStats[part.category].count += 1;
        categoryStats[part.category].value += part.quantity * part.unit_price;
      });

      const topCategories = Object.entries(categoryStats)
        .map(([category, stats]) => ({ category, ...stats }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      setDashboardData({
        totalSpareParts,
        totalStockValue,
        lowStockItems,
        recentStockOuts,
        topCategories,
        monthlyStats: null
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#023e8a' }}></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#023e8a' }}>Dashboard</h1>
        <p className="mt-2" style={{ color: '#023e8a' }}>
          Overview of your inventory management system
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#023e8a' }}>Total Spare Parts</p>
              <p className="text-2xl font-bold" style={{ color: '#023e8a' }}>{dashboardData.totalSpareParts}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(2, 62, 138, 0.1)' }}>
              <span className="text-xl font-bold" style={{ color: '#023e8a' }}>P</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#023e8a' }}>Total Stock Value</p>
              <p className="text-2xl font-bold" style={{ color: '#023e8a' }}>Rwf {dashboardData.totalStockValue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(2, 62, 138, 0.1)' }}>
              <span className="text-xl font-bold" style={{ color: '#023e8a' }}>$</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#023e8a' }}>Low Stock Items</p>
              <p className="text-2xl font-bold text-red-600">{dashboardData.lowStockItems}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
              <span className="text-xl font-bold text-red-600">!</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#023e8a' }}>Recent Stock Outs</p>
              <p className="text-2xl font-bold" style={{ color: '#023e8a' }}>{dashboardData.recentStockOuts.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(2, 62, 138, 0.1)' }}>
              <span className="text-xl font-bold" style={{ color: '#023e8a' }}>O</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Stock Outs */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: '#023e8a' }}>Recent Stock Outs</h2>
            <Link to="/stock-out" className="text-sm hover:underline" style={{ color: '#023e8a' }}>
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData.recentStockOuts.length > 0 ? (
              dashboardData.recentStockOuts.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div>
                    <p className="font-medium" style={{ color: '#023e8a' }}>{item.sparePart?.name}</p>
                    <p className="text-sm text-gray-600">{item.stock_out_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium" style={{ color: '#023e8a' }}>Qty: {item.quantity}</p>
                    <p className="text-sm text-gray-600">Rwf {parseFloat(item.total_price).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent stock outs</p>
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#023e8a' }}>Top Categories by Value</h2>
          <div className="space-y-3">
            {dashboardData.topCategories.length > 0 ? (
              dashboardData.topCategories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: 'rgba(2, 62, 138, 0.1)' }}>
                      <span className="text-sm font-bold" style={{ color: '#023e8a' }}>{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: '#023e8a' }}>{category.category}</p>
                      <p className="text-sm text-gray-600">{category.count} items</p>
                    </div>
                  </div>
                  <p className="font-medium" style={{ color: '#023e8a' }}>Rwf {category.value.toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No categories available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 card p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#023e8a' }}>Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/spare-parts" className="btn-primary px-4 py-3 text-center">
            Add Spare Part
          </Link>
          <Link to="/stock-in" className="btn-secondary px-4 py-3 text-center">
            Record Stock In
          </Link>
          <Link to="/stock-out" className="btn-secondary px-4 py-3 text-center">
            Manage Stock Out
          </Link>
          <Link to="/reports" className="btn-secondary px-4 py-3 text-center">
            Generate Reports
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
