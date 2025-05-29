import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { salaryAPI } from '../../utils/api';

const EditSalary = () => {
  const [formData, setFormData] = useState({
    employeeNumber: '',
    grossSalary: '',
    deductionPercentage: '20', // Default to 20%
    deductionAmount: '',
    netSalary: '',
    effectiveDate: '',
    endDate: '',
  });

  // State to track if we're in custom deduction mode
  const [customDeduction, setCustomDeduction] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchSalary = async () => {
      try {
        setLoading(true);
        const salaries = await salaryAPI.getAll();
        console.log('All salaries:', salaries);

        const salary = salaries.find(s => s.id.toString() === id);
        console.log('Found salary:', salary);

        if (!salary) {
          setError('Salary record not found');
          return;
        }

        // Parse salary values
        const grossSalary = parseFloat(salary.gross_salary) || 0;
        const totalDeduction = parseFloat(salary.total_deduction) || 0;
        const netSalary = parseFloat(salary.net_salary) || 0;

        // Calculate deduction percentage
        let deductionPercentage = '20'; // Default
        if (grossSalary > 0 && totalDeduction > 0) {
          deductionPercentage = ((totalDeduction / grossSalary) * 100).toFixed(2);
        }

        // Store the employee number for later use in the update
        setFormData({
          employeeNumber: salary.employee_number,
          grossSalary: grossSalary.toFixed(2),
          deductionPercentage: deductionPercentage,
          deductionAmount: totalDeduction.toFixed(2),
          netSalary: netSalary.toFixed(2),
          // Use month as the effective date
          effectiveDate: salary.month ? salary.month.split('T')[0] : '',
          month: salary.month ? salary.month.split('T')[0] : '',
        });

        setEmployeeName(`${salary.first_name} ${salary.last_name}`);
      } catch (err) {
        setError('Failed to load salary data');
        console.error('Error fetching salary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalary();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update the form data with the new value
    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    // If gross salary or deduction percentage changed, recalculate deduction and net salary
    if (name === 'grossSalary' || name === 'deductionPercentage' || name === 'deductionAmount') {
      // If we're updating gross salary or deduction percentage
      if (name === 'grossSalary' || name === 'deductionPercentage') {
        const grossSalary = parseFloat(name === 'grossSalary' ? value : formData.grossSalary) || 0;
        const deductionPercentage = parseFloat(name === 'deductionPercentage' ? value : formData.deductionPercentage) || 0;

        // Calculate deduction amount
        const deductionAmount = (grossSalary * deductionPercentage / 100).toFixed(2);
        updatedFormData.deductionAmount = deductionAmount;

        // Calculate net salary
        const netSalary = (grossSalary - parseFloat(deductionAmount)).toFixed(2);
        updatedFormData.netSalary = netSalary;
      }
      // If we're directly updating the deduction amount (custom deduction mode)
      else if (name === 'deductionAmount' && customDeduction) {
        const grossSalary = parseFloat(formData.grossSalary) || 0;
        const deductionAmount = parseFloat(value) || 0;

        // Calculate net salary
        const netSalary = (grossSalary - deductionAmount).toFixed(2);
        updatedFormData.netSalary = netSalary;

        // Calculate deduction percentage
        if (grossSalary > 0) {
          const deductionPercentage = ((deductionAmount / grossSalary) * 100).toFixed(2);
          updatedFormData.deductionPercentage = deductionPercentage;
        }
      }
    }

    setFormData(updatedFormData);
  };

  // Toggle between percentage-based and custom deduction
  const toggleCustomDeduction = () => {
    setCustomDeduction(!customDeduction);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!formData.grossSalary || isNaN(parseFloat(formData.grossSalary)) || parseFloat(formData.grossSalary) <= 0) {
      setError('Please enter a valid gross salary greater than zero');
      return;
    }

    if (!formData.deductionAmount || isNaN(parseFloat(formData.deductionAmount))) {
      setError('Please enter a valid deduction amount');
      return;
    }

    if (parseFloat(formData.deductionAmount) >= parseFloat(formData.grossSalary)) {
      setError('Deduction amount cannot be greater than or equal to gross salary');
      return;
    }

    if (!formData.effectiveDate) {
      setError('Please select an effective date');
      return;
    }

    try {
      setSaving(true);

      // Get values from form data
      const grossSalary = parseFloat(formData.grossSalary);
      const totalDeduction = parseFloat(formData.deductionAmount);
      const netSalary = parseFloat(formData.netSalary);

      // Format the data according to what the backend expects
      const salaryData = {
        grossSalary: grossSalary.toFixed(2),
        totalDeduction: totalDeduction.toFixed(2),
        netSalary: netSalary.toFixed(2),
        month: formData.effectiveDate // Using effective date as the month
      };

      console.log('Updating salary with data:', salaryData);

      await salaryAPI.update(id, salaryData);
      navigate('/salaries');
    } catch (err) {
      console.error('Error updating salary:', err);
      setError(err.response?.data?.message || 'Failed to update salary record');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-black rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-black rounded-full animate-pulse delay-75"></div>
            <div className="w-3 h-3 bg-black rounded-full animate-pulse delay-150"></div>
            <div className="w-3 h-3 bg-black rounded-full animate-pulse delay-300"></div>
          </div>
          <p className="mt-4 text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Edit Salary Record</h1>
        <Link
          to="/salaries"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Salaries
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-600 text-red-700 p-4 rounded-md shadow" role="alert">
          <div className="flex">
            <div className="py-1">
              <svg className="h-6 w-6 text-red-600 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Employee
              </label>
              <div className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md shadow-sm text-gray-700">
                {employeeName}
              </div>
            </div>

            <div>
              <label htmlFor="grossSalary" className="block text-sm font-medium text-gray-700">
                Gross Salary *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="grossSalary"
                  name="grossSalary"
                  step="0.01"
                  min="0"
                  value={formData.grossSalary}
                  onChange={handleChange}
                  className="pl-7 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                The total salary before deductions
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="deductionPercentage" className="block text-sm font-medium text-gray-700">
                  {customDeduction ? 'Deduction Amount *' : 'Deduction Percentage *'}
                </label>
                <button
                  type="button"
                  onClick={toggleCustomDeduction}
                  className="text-xs text-black hover:underline"
                >
                  {customDeduction ? 'Use percentage' : 'Custom amount'}
                </button>
              </div>

              {!customDeduction ? (
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="deductionPercentage"
                    name="deductionPercentage"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.deductionPercentage}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 pr-12"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              ) : (
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="deductionAmount"
                    name="deductionAmount"
                    step="0.01"
                    min="0"
                    value={formData.deductionAmount}
                    onChange={handleChange}
                    className="pl-7 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                    required
                  />
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {!customDeduction
                  ? `Deduction amount: $${formData.deductionAmount || '0.00'}`
                  : `Equivalent to ${formData.deductionPercentage || '0'}% of gross salary`
                }
              </p>
            </div>

            <div>
              <label htmlFor="netSalary" className="block text-sm font-medium text-gray-700">
                Net Salary
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  id="netSalary"
                  name="netSalary"
                  value={formData.netSalary}
                  className="pl-7 mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-500"
                  disabled
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Gross salary minus deductions
              </p>
            </div>

            <div>
              <label htmlFor="effectiveDate" className="block text-sm font-medium text-gray-700">
                Effective Date *
              </label>
              <input
                type="date"
                id="effectiveDate"
                name="effectiveDate"
                value={formData.effectiveDate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                required
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Leave blank if this is the current salary
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSalary;
