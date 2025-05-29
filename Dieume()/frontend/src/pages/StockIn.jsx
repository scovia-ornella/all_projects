import React, { useState, useEffect } from 'react';
import { stockInAPI, sparePartsAPI } from '../services/api';
import Modal from '../components/Modal';

const StockIn = () => {
  const [formData, setFormData] = useState({
    spare_part_id: '',
    quantity: '',
    stock_in_date: new Date().toISOString().split('T')[0], // Today's date
  });
  const [spareParts, setSpareParts] = useState([]);
  const [stockInEntries, setStockInEntries] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [sparePartsResponse, stockInResponse] = await Promise.all([
        sparePartsAPI.getAll(),
        stockInAPI.getAll()
      ]);

      if (sparePartsResponse.data.success) {
        setSpareParts(sparePartsResponse.data.data);
      }

      if (stockInResponse.data.success) {
        setStockInEntries(stockInResponse.data.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpareParts = async () => {
    try {
      const response = await sparePartsAPI.getAll();
      if (response.data.success) {
        setSpareParts(response.data.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load spare parts' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear message when user starts typing
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Convert numeric fields
      const submitData = {
        ...formData,
        spare_part_id: parseInt(formData.spare_part_id),
        quantity: parseInt(formData.quantity),
      };

      const response = await stockInAPI.create(submitData);

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Stock in entry created successfully!' });
        // Reset form but keep the date
        setFormData({
          spare_part_id: '',
          quantity: '',
          stock_in_date: formData.stock_in_date,
        });
        // Refresh data to show updated quantities and new entries
        fetchData();
        // Close modal
        setIsModalOpen(false);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create stock in entry';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMessage({ type: '', text: '' });
    setFormData({
      spare_part_id: '',
      quantity: '',
      stock_in_date: new Date().toISOString().split('T')[0],
    });
  };

  const selectedSparePart = spareParts.find(sp => sp.id === parseInt(formData.spare_part_id));

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#023e8a' }}>Stock In Management</h1>
            <p className="mt-2" style={{ color: '#023e8a' }}>
              Track and manage stock additions to inventory
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary px-6 py-3"
          >
            Record Stock In
          </button>
        </div>
      </div>

      {/* Stock In Entries List */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#023e8a' }}>Recent Stock In Entries</h2>

        {stockInEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="table-header">
                  <th className="table-cell">Spare Part</th>
                  <th className="table-cell">Category</th>
                  <th className="table-cell">Quantity Added</th>
                  <th className="table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {stockInEntries.map((entry) => (
                  <tr key={entry.id} className="table-row">
                    <td className="table-cell font-medium">{entry.sparePart?.name}</td>
                    <td className="table-cell">{entry.sparePart?.category}</td>
                    <td className="table-cell">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        +{entry.quantity}
                      </span>
                    </td>
                    <td className="table-cell">{new Date(entry.stock_in_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No stock in entries found. Record your first stock in using the button above.</p>
          </div>
        )}
      </div>

      {/* Record Stock In Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Record Stock In"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="spare_part_id" className="block text-sm font-medium text-gray-700 mb-2">
                Spare Part *
              </label>
              <select
                id="spare_part_id"
                name="spare_part_id"
                required
                className="input"
                value={formData.spare_part_id}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">Select a spare part</option>
                {spareParts.map((sparePart) => (
                  <option key={sparePart.id} value={sparePart.id}>
                    {sparePart.name} - {sparePart.category} (Current: {sparePart.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                required
                min="1"
                className="input"
                placeholder="Enter quantity"
                value={formData.quantity}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="stock_in_date" className="block text-sm font-medium text-gray-700 mb-2">
                Stock In Date *
              </label>
              <input
                type="date"
                id="stock_in_date"
                name="stock_in_date"
                required
                className="input"
                value={formData.stock_in_date}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {selectedSparePart && formData.quantity && (
            <div className="p-4 rounded-md" style={{ backgroundColor: 'rgba(2, 62, 138, 0.1)', color: '#023e8a' }}>
              <div className="text-sm space-y-1">
                <div><strong>Selected Part:</strong> {selectedSparePart.name}</div>
                <div><strong>Category:</strong> {selectedSparePart.category}</div>
                <div><strong>Current Stock:</strong> {selectedSparePart.quantity}</div>
                <div><strong>After Stock In:</strong> {selectedSparePart.quantity + parseInt(formData.quantity || 0)}</div>
              </div>
            </div>
          )}

          {message.text && (
            <div className={`rounded-md p-4 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="btn-secondary px-6 py-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-6 py-2"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Recording...
                </div>
              ) : (
                'Record Stock In'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockIn;
