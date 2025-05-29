import React, { useState, useEffect } from 'react';
import { stockOutAPI, sparePartsAPI } from '../services/api';

const StockOut = () => {
  const [stockOuts, setStockOuts] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    spare_part_id: '',
    quantity: '',
    unit_price: '',
    stock_out_date: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [stockOutResponse, sparePartsResponse] = await Promise.all([
        stockOutAPI.getAll(),
        sparePartsAPI.getAll()
      ]);

      if (stockOutResponse.data.success) {
        setStockOuts(stockOutResponse.data.data);
      }
      if (sparePartsResponse.data.success) {
        setSpareParts(sparePartsResponse.data.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load data' });
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
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const submitData = {
        ...formData,
        spare_part_id: parseInt(formData.spare_part_id),
        quantity: parseInt(formData.quantity),
        unit_price: parseFloat(formData.unit_price),
      };

      let response;
      if (editingItem) {
        response = await stockOutAPI.update(editingItem.id, submitData);
      } else {
        response = await stockOutAPI.create(submitData);
      }

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: `Stock out entry ${editingItem ? 'updated' : 'created'} successfully!`
        });
        resetForm();
        fetchData();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
        `Failed to ${editingItem ? 'update' : 'create'} stock out entry`;
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      spare_part_id: item.spare_part_id.toString(),
      quantity: item.quantity.toString(),
      unit_price: item.unit_price.toString(),
      stock_out_date: item.stock_out_date,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stock out entry?')) {
      return;
    }

    try {
      const response = await stockOutAPI.delete(id);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Stock out entry deleted successfully!' });
        fetchData();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete stock out entry';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  const resetForm = () => {
    setFormData({
      spare_part_id: '',
      quantity: '',
      unit_price: '',
      stock_out_date: new Date().toISOString().split('T')[0],
    });
    setEditingItem(null);
    setShowForm(false);
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
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Out</h1>
          <p className="mt-2 text-gray-600">
            Manage outgoing spare parts and track inventory usage.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary px-6 py-2"
        >
          {showForm ? 'Hide Form' : 'Add Stock Out'}
        </button>
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

      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingItem ? 'Edit Stock Out Entry' : 'Add New Stock Out Entry'}
          </h2>
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
                      {sparePart.name} - {sparePart.category} (Available: {sparePart.quantity})
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

              <div>
                <label htmlFor="stock_out_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Out Date *
                </label>
                <input
                  type="date"
                  id="stock_out_date"
                  name="stock_out_date"
                  required
                  className="input"
                  value={formData.stock_out_date}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {selectedSparePart && formData.quantity && formData.unit_price && (
              <div className="p-4 rounded-md" style={{ backgroundColor: 'rgba(2, 62, 138, 0.1)', color: '#023e8a' }}>
                <div className="text-sm space-y-1">
                  <div><strong>Selected Part:</strong> {selectedSparePart.name}</div>
                  <div><strong>Available Stock:</strong> {selectedSparePart.quantity}</div>
                  <div><strong>Total Price:</strong> Rwf {(parseFloat(formData.unit_price) * parseInt(formData.quantity)).toLocaleString()}</div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
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
                    {editingItem ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  editingItem ? 'Update Stock Out' : 'Create Stock Out'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Stock Out Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-cell text-left font-medium text-gray-900">Spare Part</th>
                <th className="table-cell text-left font-medium text-gray-900">Category</th>
                <th className="table-cell text-left font-medium text-gray-900">Quantity</th>
                <th className="table-cell text-left font-medium text-gray-900">Unit Price</th>
                <th className="table-cell text-left font-medium text-gray-900">Total Price</th>
                <th className="table-cell text-left font-medium text-gray-900">Date</th>
                <th className="table-cell text-left font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockOuts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-cell text-center text-gray-500 py-8">
                    No stock out records found
                  </td>
                </tr>
              ) : (
                stockOuts.map((item) => (
                  <tr key={item.id} className="table-row">
                    <td className="table-cell font-medium">{item.sparePart?.name}</td>
                    <td className="table-cell">{item.sparePart?.category}</td>
                    <td className="table-cell">{item.quantity}</td>
                    <td className="table-cell">Rwf {parseFloat(item.unit_price).toLocaleString()}</td>
                    <td className="table-cell">Rwf {parseFloat(item.total_price).toLocaleString()}</td>
                    <td className="table-cell">{item.stock_out_date}</td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockOut;
