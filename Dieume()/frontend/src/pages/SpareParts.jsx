import React, { useState, useEffect } from 'react';
import { sparePartsAPI } from '../services/api';
import Modal from '../components/Modal';

const SpareParts = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit_price: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [spareParts, setSpareParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSpareParts();
  }, []);

  const fetchSpareParts = async () => {
    try {
      setIsLoading(true);
      const response = await sparePartsAPI.getAll();
      if (response.data.success) {
        setSpareParts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching spare parts:', error);
      setMessage({ type: 'error', text: 'Failed to load spare parts' });
    } finally {
      setIsLoading(false);
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
        quantity: parseInt(formData.quantity),
        unit_price: parseFloat(formData.unit_price),
      };

      const response = await sparePartsAPI.create(submitData);

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Spare part created successfully!' });
        // Reset form
        setFormData({
          name: '',
          category: '',
          quantity: '',
          unit_price: '',
        });
        // Refresh the spare parts list
        fetchSpareParts();
        // Close modal
        setIsModalOpen(false);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create spare part';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMessage({ type: '', text: '' });
    setFormData({
      name: '',
      category: '',
      quantity: '',
      unit_price: '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#023e8a' }}>Spare Parts Inventory</h1>
            <p className="mt-2" style={{ color: '#023e8a' }}>
              Manage your spare parts inventory
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary px-6 py-3"
          >
            Add New Spare Part
          </button>
        </div>
      </div>

      {/* Spare Parts List */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#023e8a' }}>Current Inventory</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#023e8a' }}></div>
          </div>
        ) : spareParts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="table-header">
                  <th className="table-cell">Name</th>
                  <th className="table-cell">Category</th>
                  <th className="table-cell">Quantity</th>
                  <th className="table-cell">Unit Price</th>
                  <th className="table-cell">Total Value</th>
                  <th className="table-cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {spareParts.map((part) => (
                  <tr key={part.id} className="table-row">
                    <td className="table-cell font-medium">{part.name}</td>
                    <td className="table-cell">{part.category}</td>
                    <td className="table-cell">{part.quantity}</td>
                    <td className="table-cell">Rwf {parseFloat(part.unit_price).toLocaleString()}</td>
                    <td className="table-cell">Rwf {(part.quantity * parseFloat(part.unit_price)).toLocaleString()}</td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        part.quantity <= 5
                          ? 'bg-red-100 text-red-800'
                          : part.quantity <= 10
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {part.quantity <= 5 ? 'Low Stock' : part.quantity <= 10 ? 'Medium' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No spare parts found. Add your first spare part using the button above.</p>
          </div>
        )}
      </div>

      {/* Add Spare Part Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add New Spare Part"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Spare Part Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="input"
                placeholder="Enter spare part name"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <input
                type="text"
                id="category"
                name="category"
                required
                className="input"
                placeholder="Enter category"
                value={formData.category}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Initial Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                required
                min="0"
                className="input"
                placeholder="Enter quantity"
                value={formData.quantity}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700 mb-2">
                Unit Price *
              </label>
              <input
                type="number"
                id="unit_price"
                name="unit_price"
                required
                min="0"
                step="0.01"
                className="input"
                placeholder="Enter unit price"
                value={formData.unit_price}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {formData.quantity && formData.unit_price && (
            <div className="p-4 rounded-md" style={{ backgroundColor: 'rgba(2, 62, 138, 0.1)', color: '#023e8a' }}>
              <div className="text-sm">
                <strong>Total Price: </strong>
                Rwf {(parseFloat(formData.unit_price || 0) * parseInt(formData.quantity || 0)).toLocaleString()}
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
                  Creating...
                </div>
              ) : (
                'Create Spare Part'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SpareParts;
