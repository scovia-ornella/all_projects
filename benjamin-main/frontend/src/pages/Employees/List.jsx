import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Edit, Trash2, Search, Users, Filter, Download, ChevronDown } from 'lucide-react';
import { employeeAPI } from '../../utils/api';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await employeeAPI.getAll();
        setEmployees(data);
      } catch (err) {
        setError('Failed to load employees');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleDelete = async (number) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      await employeeAPI.delete(number);
      setEmployees(employees.filter(employee => employee.employee_number !== number));
    } catch (err) {
      setError('Failed to delete employee');
      console.error(err);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) ||
           (employee.employee_number && employee.employee_number.toLowerCase().includes(searchLower)) ||
           (employee.position && employee.position.toLowerCase().includes(searchLower)) ||
           (employee.department_name && employee.department_name.toLowerCase().includes(searchLower));
  });

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
      {/* Page header */}
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-6 text-gray-900">Employees</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Link
            to="/employees/add"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            <UserPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Employee
          </Link>
        </div>
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

      {/* Action buttons */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black mr-3"
            >
              <Download className="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Employee list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <li key={employee.employee_number}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-black text-white flex items-center justify-center text-sm font-medium">
                        {employee.first_name?.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-black">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {employee.employee_number}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.position || 'No position'} {employee.department_name && `• ${employee.department_name}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-500 mr-4 text-right hidden sm:block">
                        <div>Hired: {employee.hired_date ? new Date(employee.hired_date).toLocaleDateString() : 'N/A'}</div>
                        <div>{employee.telephone || 'No contact info'}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/employees/edit/${employee.employee_number}`}
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(employee.employee_number)}
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new employee or try a different search.</p>
              <div className="mt-6">
                <Link
                  to="/employees/add"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  <UserPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Add Employee
                </Link>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default EmployeeList;
