import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const ServiceRecords = () => {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [cars, setCars] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    plateNumber: '',
    serviceCode: '',
    amountPaid: ''
  });
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  
  const { plateNumber, serviceCode, amountPaid } = formData;
  
  // Fetch all service records, cars, and services
  const fetchData = async () => {
    try {
      const [recordsRes, carsRes, servicesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/service-records'),
        axios.get('http://localhost:5000/api/cars'),
        axios.get('http://localhost:5000/api/services')
      ]);
      
      setRecords(recordsRes.data);
      setCars(carsRes.data);
      setServices(servicesRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
    
    // If selecting a service, auto-fill the amount
    if (e.target.name === 'serviceCode') {
      const selectedService = services.find(service => service.ServiceCode === e.target.value);
      if (selectedService) {
        setFormData({
          ...formData,
          serviceCode: e.target.value,
          amountPaid: selectedService.ServicePrice
        });
      }
    }
  };
  
  const resetForm = () => {
    setFormData({
      plateNumber: '',
      serviceCode: '',
      amountPaid: ''
    });
    setEditMode(false);
    setCurrentRecord(null);
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!plateNumber || !serviceCode || !amountPaid) {
      setFormError('Please fill in all fields');
      return;
    }
    
    try {
      if (editMode && currentRecord) {
        // Update existing record
        await axios.put(`http://localhost:5000/api/service-records/${currentRecord.RecordNumber}`, formData);
        setSuccess('Service record updated successfully');
      } else {
        // Add new record
        await axios.post('http://localhost:5000/api/service-records', formData);
        setSuccess('Service record added successfully');
      }
      
      // Reset form
      resetForm();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Error with service record:', err);
      setFormError(err.response?.data?.msg || 'Failed to process service record');
    }
  };
  
  const onEdit = (record) => {
    setFormData({
      plateNumber: record.PlateNumber,
      serviceCode: record.ServiceCode,
      amountPaid: record.AmountPaid
    });
    setEditMode(true);
    setCurrentRecord(record);
  };
  
  const onDelete = async (recordNumber) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`http://localhost:5000/api/service-records/${recordNumber}`);
        setSuccess('Service record deleted successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
        
        // Refresh data
        fetchData();
      } catch (err) {
        console.error('Error deleting record:', err);
        setError('Failed to delete record');
      }
    }
  };
  
  const onGenerateBill = async (recordNumber) => {
    try {
      window.open(`http://localhost:5000/api/reports/bill/${recordNumber}`, '_blank');
    } catch (err) {
      console.error('Error generating bill:', err);
      setError('Failed to generate bill');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Service Records Management</h1>
      
      {/* Add/Edit Service Record Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {editMode ? 'Edit Service Record' : 'Add New Service Record'}
        </h2>
        
        {formError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {formError}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="mb-4">
              <label 
                htmlFor="plateNumber" 
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Car Plate Number
              </label>
              <select
                id="plateNumber"
                name="plateNumber"
                value={plateNumber}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select a car</option>
                {cars.map(car => (
                  <option key={car.PlateNumber} value={car.PlateNumber}>
                    {car.PlateNumber} - {car.Model}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label 
                htmlFor="serviceCode" 
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Service
              </label>
              <select
                id="serviceCode"
                name="serviceCode"
                value={serviceCode}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select a service</option>
                {services.map(service => (
                  <option key={service.ServiceCode} value={service.ServiceCode}>
                    {service.ServiceName} - {Number(service.ServicePrice).toLocaleString()} RWF
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label 
                htmlFor="amountPaid" 
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Amount Paid (RWF)
              </label>
              <input
                type="number"
                id="amountPaid"
                name="amountPaid"
                value={amountPaid}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g. 150000"
              />
            </div>
          </div>
          
          <div className="mt-2 flex space-x-2">
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-md transition duration-300"
            >
              {editMode ? 'Update Record' : 'Add Record'}
            </button>
            
            {editMode && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Service Records List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Service Records List</h2>
        
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : records.length === 0 ? (
          <p className="text-gray-500">No service records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Record #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plate Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Received By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.RecordNumber}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.RecordNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.PlateNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.ServiceName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Number(record.AmountPaid).toLocaleString()} RWF
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.PaymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.ReceivedByUser}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                      <button
                        onClick={() => onEdit(record)}
                        className="text-teal-600 hover:text-teal-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(record.RecordNumber)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => onGenerateBill(record.RecordNumber)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceRecords;
