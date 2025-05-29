import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  DollarSign,
  BarChart,
  Building2,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TopNav = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get user first initial
  const getUserInitial = () => {
    if (!user) return '';
    return user.firstName.charAt(0);
  };

  const navLinks = [
    { to: '/', icon: <Home size={20} />, text: 'Dashboard' },
    { to: '/departments', icon: <Building2 size={20} />, text: 'Departments' },
    { to: '/employees', icon: <Users size={20} />, text: 'Employees' },
    { to: '/salaries', icon: <DollarSign size={20} />, text: 'Salaries' },
    { to: '/reports', icon: <BarChart size={20} />, text: 'Reports' },
  ];

  return (
    <>
      {/* Top Navigation */}
      <header className="bg-black text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold tracking-tight">EMS</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.text}
                </NavLink>
              ))}
            </div>

            {/* User Menu & Mobile Menu Button */}
            <div className="flex items-center">
              {/* User dropdown */}
              {user && (
                <div className="ml-3 relative" ref={userMenuRef}>
                  <div>
                    <button
                      type="button"
                      className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                      id="user-menu-button"
                      aria-expanded="false"
                      aria-haspopup="true"
                      onClick={toggleUserMenu}
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-black text-white flex items-center justify-center text-sm font-medium">
                          {getUserInitial()}
                        </div>
                        <span className="hidden md:flex md:items-center ml-2 text-sm font-medium text-white">
                          {user.firstName} {user.lastName}
                          <ChevronDown size={16} className="ml-1" />
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* User dropdown menu */}
                  {userMenuOpen && (
                    <div
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                      tabIndex="-1"
                    >
                      <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-200">
                        Signed in as <span className="font-medium text-gray-900">{user.username}</span>
                      </div>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        role="menuitem"
                        tabIndex="-1"
                        id="user-menu-item-0"
                      >
                        <Settings size={16} className="mr-2" />
                        Your Profile
                      </a>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        role="menuitem"
                        tabIndex="-1"
                        id="user-menu-item-2"
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden ml-4 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                  onClick={closeMobileMenu}
                >
                  <span className="mr-3">{link.icon}</span>
                  {link.text}
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white flex items-center"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default TopNav;
