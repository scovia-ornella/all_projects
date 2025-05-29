import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, DollarSign, BarChart, UserPlus, Building2 } from 'lucide-react';
import { employeeAPI, salaryAPI, reportAPI } from '../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    employeeCount: 0,
    departments: [],
    recentEmployees: [],
    averageSalary: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch employees
        const employees = await employeeAPI.getAll();

        // Fetch salaries
        const salaries = await salaryAPI.getAll();

        // Fetch department summary
        const departments = await reportAPI.getDepartmentSummary();

        // Calculate average salary - handle potential NaN values
        let totalSalary = 0;
        let validSalaries = 0;

        console.log('Salary data for average calculation:', salaries);

        salaries.forEach(salary => {
          // Try to get the salary amount from different possible fields
          let amount = null;

          if (salary.net_salary !== undefined) {
            amount = parseFloat(salary.net_salary);
          } else if (salary.amount !== undefined) {
            amount = parseFloat(salary.amount);
          } else if (salary.gross_salary !== undefined) {
            amount = parseFloat(salary.gross_salary);
          }

          if (!isNaN(amount) && amount > 0) {
            totalSalary += amount;
            validSalaries++;
          }
        });

        const averageSalary = validSalaries > 0 ? totalSalary / validSalaries : 0;
        console.log('Calculated average salary:', averageSalary);

        // Get recent employees (last 5)
        const recentEmployees = [...employees]
          .sort((a, b) => {
            // Handle potential missing dates
            const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
            const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
            return dateB - dateA;
          })
          .slice(0, 5);

        setStats({
          employeeCount: employees.length,
          departments,
          recentEmployees,
          averageSalary,
        });
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  if (error) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/employees/add"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Employee
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-black to-gray-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Employees</p>
                <p className="text-3xl font-bold text-black mt-1">{stats.employeeCount}</p>
              </div>
              <div className="bg-black p-3 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/employees" className="text-sm font-medium text-black hover:underline">
                View all employees →
              </Link>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-black to-gray-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Average Salary</p>
                <p className="text-3xl font-bold text-black mt-1">
                  ${stats && stats.averageSalary !== undefined ?
                    (isNaN(stats.averageSalary) ? "0.00" : parseFloat(stats.averageSalary).toFixed(2))
                    : "0.00"}
                </p>
              </div>
              <div className="bg-black p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/salaries" className="text-sm font-medium text-black hover:underline">
                View all salaries →
              </Link>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-black to-gray-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Departments</p>
                <p className="text-3xl font-bold text-black mt-1">{stats.departments.length}</p>
              </div>
              <div className="bg-black p-3 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/departments" className="text-sm font-medium text-black hover:underline">
                View all departments →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Employees */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Employees</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">A list of the most recently added employees.</p>
          </div>
          <Link
            to="/employees"
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            View All
          </Link>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {stats.recentEmployees.length > 0 ? (
              stats.recentEmployees.map((employee) => (
                <li key={employee.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-black text-white flex items-center justify-center text-sm font-medium">
                        {employee.first_name?.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.first_name} {employee.last_name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-6">
                        <div className="text-sm text-gray-900">{employee.position || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{employee.department || 'N/A'}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No employees</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding a new employee.</p>
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
    </div>
  );
};

export default Dashboard;
