import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  DollarSign,
  BarChart,
  Building2,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Laravel Breeze-inspired navigation link style
  const navLinkClass = ({ isActive }) =>
    `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-black text-white'
        : 'text-gray-600 hover:bg-gray-100 hover:text-black'
    }`;

  return (
    <div className="bg-white text-gray-800 w-64 flex flex-col h-full border-r border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-black">EMS</h1>
        <p className="text-gray-500 text-sm">Employee Management System</p>
      </div>

      <nav className="flex-1 px-3 py-6">
        <div className="space-y-1">
          <NavLink to="/" className={navLinkClass}>
            <Home className="mr-3 h-5 w-5" />
            Dashboard
          </NavLink>

          <NavLink to="/departments" className={navLinkClass}>
            <Building2 className="mr-3 h-5 w-5" />
            Departments
          </NavLink>

          <NavLink to="/employees" className={navLinkClass}>
            <Users className="mr-3 h-5 w-5" />
            Employees
          </NavLink>

          <NavLink to="/salaries" className={navLinkClass}>
            <DollarSign className="mr-3 h-5 w-5" />
            Salaries
          </NavLink>

          <NavLink to="/reports" className={navLinkClass}>
            <BarChart className="mr-3 h-5 w-5" />
            Reports
          </NavLink>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-black rounded-md w-full transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
