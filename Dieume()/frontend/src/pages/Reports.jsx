import React, { useState } from 'react';
import { reportsAPI } from '../services/api';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('daily-stock-out');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const tabs = [
    { id: 'daily-stock-out', name: 'Daily Stock Out Report' },
    { id: 'daily-stock-status', name: 'Daily Stock Status Report' },
    { id: 'stock-movement', name: 'Stock Movement Summary' },
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateReport = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    setReportData(null);

    try {
      let response;

      switch (activeTab) {
        case 'daily-stock-out':
          response = await reportsAPI.dailyStockOut(filters.date);
          break;
        case 'daily-stock-status':
          response = await reportsAPI.dailyStockStatus(filters.date);
          break;
        case 'stock-movement':
          response = await reportsAPI.stockMovementSummary(filters.startDate, filters.endDate);
          break;
        default:
          throw new Error('Invalid report type');
      }

      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to generate report';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const printReport = () => {
    const printContent = document.getElementById('printable-report');
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const renderDailyStockOutReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="p-4 rounded-md" style={{ backgroundColor: 'rgba(2, 62, 138, 0.1)', color: '#023e8a' }}>
          <h3 className="font-semibold mb-2">Report Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span>Total Entries:</span>
              <span className="font-medium ml-2">{reportData.summary.totalEntries}</span>
            </div>
            <div>
              <span>Total Quantity:</span>
              <span className="font-medium ml-2">{reportData.summary.totalQuantity}</span>
            </div>
            <div>
              <span>Total Value:</span>
              <span className="font-medium ml-2">Rwf {parseFloat(reportData.summary.totalValue).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-cell text-left font-medium">Spare Part</th>
                <th className="table-cell text-left font-medium">Category</th>
                <th className="table-cell text-left font-medium">Quantity</th>
                <th className="table-cell text-left font-medium">Unit Price</th>
                <th className="table-cell text-left font-medium">Total Price</th>
              </tr>
            </thead>
            <tbody>
              {reportData.stockOuts.map((item, index) => (
                <tr key={index} className="table-row">
                  <td className="table-cell">{item.sparePart?.name}</td>
                  <td className="table-cell">{item.sparePart?.category}</td>
                  <td className="table-cell">{item.quantity}</td>
                  <td className="table-cell">Rwf {parseFloat(item.unit_price).toLocaleString()}</td>
                  <td className="table-cell">Rwf {parseFloat(item.total_price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDailyStockStatusReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="p-4 rounded-md" style={{ backgroundColor: 'rgba(2, 62, 138, 0.1)', color: '#023e8a' }}>
          <h3 className="font-semibold mb-2">Report Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span>Total Spare Parts:</span>
              <span className="font-medium ml-2">{reportData.summary.totalSpareParts}</span>
            </div>
            <div>
              <span>Total Stock In:</span>
              <span className="font-medium ml-2">{reportData.summary.totalStockIn}</span>
            </div>
            <div>
              <span>Total Stock Out:</span>
              <span className="font-medium ml-2">{reportData.summary.totalStockOut}</span>
            </div>
            <div>
              <span>Total Remaining:</span>
              <span className="font-medium ml-2">{reportData.summary.totalRemainingQuantity}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-cell text-left font-medium">Spare Part</th>
                <th className="table-cell text-left font-medium">Category</th>
                <th className="table-cell text-left font-medium">Stock In</th>
                <th className="table-cell text-left font-medium">Stock Out</th>
                <th className="table-cell text-left font-medium">Remaining</th>
                <th className="table-cell text-left font-medium">Current Stock</th>
              </tr>
            </thead>
            <tbody>
              {reportData.stockStatus.map((item, index) => (
                <tr key={index} className="table-row">
                  <td className="table-cell">{item.name}</td>
                  <td className="table-cell">{item.category}</td>
                  <td className="table-cell">{item.totalStockIn}</td>
                  <td className="table-cell">{item.totalStockOut}</td>
                  <td className="table-cell">{item.remainingQuantity}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.currentStock > 10
                        ? 'bg-green-100 text-green-800'
                        : item.currentStock > 5
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.currentStock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderStockMovementReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stock In Summary */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Stock In Summary</h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-cell text-left font-medium text-xs">Spare Part</th>
                    <th className="table-cell text-left font-medium text-xs">Total Qty</th>
                    <th className="table-cell text-left font-medium text-xs">Entries</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.stockInSummary.map((item, index) => (
                    <tr key={index} className="table-row">
                      <td className="table-cell text-xs">{item.sparePart?.name}</td>
                      <td className="table-cell text-xs">{item.totalQuantity || 0}</td>
                      <td className="table-cell text-xs">{item.totalEntries || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stock Out Summary */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Stock Out Summary</h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-cell text-left font-medium text-xs">Spare Part</th>
                    <th className="table-cell text-left font-medium text-xs">Total Qty</th>
                    <th className="table-cell text-left font-medium text-xs">Total Value</th>
                    <th className="table-cell text-left font-medium text-xs">Entries</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.stockOutSummary.map((item, index) => (
                    <tr key={index} className="table-row">
                      <td className="table-cell text-xs">{item.sparePart?.name}</td>
                      <td className="table-cell text-xs">{item.totalQuantity || 0}</td>
                      <td className="table-cell text-xs">Rwf {parseFloat(item.totalValue || 0).toLocaleString()}</td>
                      <td className="table-cell text-xs">{item.totalEntries || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="mt-2 text-gray-600">
          Generate and view various inventory reports.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setReportData(null);
                setMessage({ type: '', text: '' });
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500'
                  : 'border-transparent hover:border-gray-300'
              }`}
              style={{
                color: activeTab === tab.id ? '#023e8a' : '#6b7280'
              }}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeTab === 'stock-movement' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="input"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Date
              </label>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="input"
              />
            </div>
          )}
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={isLoading}
              className="btn-primary px-6 py-2 w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </div>
              ) : (
                'Generate Report'
              )}
            </button>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 rounded-md p-4 ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Report Content */}
      {reportData && (
        <div className="card p-6">
          <div className="mb-4 flex justify-between items-center no-print">
            <h2 className="text-lg font-semibold" style={{ color: '#023e8a' }}>
              {tabs.find(tab => tab.id === activeTab)?.name}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="text-sm" style={{ color: '#023e8a' }}>
                {activeTab === 'stock-movement'
                  ? `${reportData.period?.startDate} to ${reportData.period?.endDate}`
                  : `Date: ${reportData.date}`
                }
              </div>
              <button
                onClick={printReport}
                className="btn-primary px-4 py-2"
              >
                Print Report
              </button>
            </div>
          </div>

          {/* Printable Report Content */}
          <div id="printable-report">
            {/* Report Header for Print */}
            <div className="print-only mb-8 text-center">
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#023e8a' }}>SmartPark SIMS</h1>
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#023e8a' }}>
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h2>
              <p className="text-sm" style={{ color: '#023e8a' }}>
                {activeTab === 'stock-movement'
                  ? `Period: ${reportData.period?.startDate} to ${reportData.period?.endDate}`
                  : `Date: ${reportData.date}`
                }
              </p>
              <p className="text-sm" style={{ color: '#023e8a' }}>
                Generated on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>

            {activeTab === 'daily-stock-out' && renderDailyStockOutReport()}
            {activeTab === 'daily-stock-status' && renderDailyStockStatusReport()}
            {activeTab === 'stock-movement' && renderStockMovementReport()}

            {/* Signature Section for Print */}
            <div className="print-only mt-12">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-medium mb-8" style={{ color: '#023e8a' }}>Prepared by:</p>
                  <div className="border-b border-gray-400 mb-2" style={{ height: '1px', width: '200px' }}></div>
                  <p className="text-xs" style={{ color: '#023e8a' }}>Name & Signature</p>
                  <p className="text-xs mt-4" style={{ color: '#023e8a' }}>Date: _______________</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-8" style={{ color: '#023e8a' }}>Approved by:</p>
                  <div className="border-b border-gray-400 mb-2" style={{ height: '1px', width: '200px' }}></div>
                  <p className="text-xs" style={{ color: '#023e8a' }}>Manager Name & Signature</p>
                  <p className="text-xs mt-4" style={{ color: '#023e8a' }}>Date: _______________</p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <p className="text-xs" style={{ color: '#023e8a' }}>
                  SmartPark Inventory Management System - Rubavu, Rwanda
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!reportData && !isLoading && (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4" style={{ color: '#023e8a' }}>R</div>
          <h3 className="text-lg font-medium mb-2" style={{ color: '#023e8a' }}>No Report Generated</h3>
          <p style={{ color: '#023e8a' }}>
            Select your filters and click "Generate Report" to view data.
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
