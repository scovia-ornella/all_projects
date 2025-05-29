import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Spare Parts', href: '/spare-parts' },
    { name: 'Stock In', href: '/stock-in' },
    { name: 'Stock Out', href: '/stock-out' },
    { name: 'Reports', href: '/reports' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faedcd' }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: '#023e8a' }} className="shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="text-xl font-bold" style={{ color: '#faedcd' }}>
                  SmartPark SIMS
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive(item.href)
                        ? 'border-yellow-300'
                        : 'border-transparent hover:border-yellow-300'
                    }`}
                    style={{
                      color: isActive(item.href) ? '#faedcd' : 'rgba(250, 237, 205, 0.8)'
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* User menu */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="flex items-center space-x-4">
                <span className="text-sm" style={{ color: '#faedcd' }}>
                  Welcome, {user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-secondary px-3 py-2"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-opacity-20 hover:bg-white"
                style={{ color: '#faedcd' }}
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden" style={{ backgroundColor: '#023e8a' }}>
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive(item.href)
                      ? 'border-yellow-300'
                      : 'border-transparent hover:border-yellow-300'
                  }`}
                  style={{
                    color: isActive(item.href) ? '#faedcd' : 'rgba(250, 237, 205, 0.8)',
                    backgroundColor: isActive(item.href) ? 'rgba(250, 237, 205, 0.1)' : 'transparent'
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t" style={{ borderColor: 'rgba(250, 237, 205, 0.3)' }}>
              <div className="flex items-center px-4">
                <div className="text-base font-medium" style={{ color: '#faedcd' }}>
                  {user?.username}
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-base font-medium w-full text-left hover:bg-opacity-20 hover:bg-white"
                  style={{ color: 'rgba(250, 237, 205, 0.8)' }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
