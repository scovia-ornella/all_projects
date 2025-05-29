import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu } from 'lucide-react';

const Header = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Get page title based on current path
  const getPageTitle = () => {
    switch (true) {
      case pathname === '/':
        return 'Dashboard';
      case pathname.startsWith('/employees'):
        if (pathname.includes('/add')) return 'Add Employee';
        if (pathname.includes('/edit')) return 'Edit Employee';
        return 'Employees';
      case pathname.startsWith('/salaries'):
        if (pathname.includes('/add')) return 'Add Salary';
        if (pathname.includes('/edit')) return 'Edit Salary';
        return 'Salaries';
      case pathname.startsWith('/departments'):
        if (pathname.includes('/add')) return 'Add Department';
        if (pathname.includes('/edit')) return 'Edit Department';
        return 'Departments';
      case pathname === '/reports':
        return 'Reports';
      default:
        return 'Employee Management System';
    }
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  return (
    <header className="bg-white border-b border-gray-200 z-10">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button className="md:hidden mr-4 text-gray-500 hover:text-gray-700 focus:outline-none">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-black">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center">
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-gray-700 hidden sm:block">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium shadow-sm">
              {getUserInitials()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
