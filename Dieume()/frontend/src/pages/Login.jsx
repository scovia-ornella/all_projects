import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login, register, isAuthenticated, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Set active tab based on route
  useEffect(() => {
    if (location.pathname === '/register') {
      setActiveTab('signup');
    } else {
      setActiveTab('login');
    }
  }, [location.pathname]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formError) setFormError('');
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formError) setFormError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    if (!loginData.username.trim() || !loginData.password.trim()) {
      setFormError('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(loginData);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setFormError(result.message || 'Login failed');
      }
    } catch (error) {
      setFormError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    if (!registerData.username.trim() || !registerData.password.trim() || !registerData.confirmPassword.trim()) {
      setFormError('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setFormError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (registerData.password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await register(registerData);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setFormError(result.message || 'Registration failed');
      }
    } catch (error) {
      setFormError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#faedcd' }}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#023e8a' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#faedcd' }}>
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: '#5a6c7d' }}>
          {/* User Icon */}
          <div className="flex justify-center pt-8 pb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4a9eff' }}>
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: 'white' }}></div>
              <div className="absolute w-3 h-3 rounded-full mt-6 ml-4" style={{ backgroundColor: '#4ade80' }}></div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-8">
              <button
                onClick={() => {
                  navigate('/login');
                  setFormError('');
                }}
                className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'login'
                    ? 'border-teal-400 text-teal-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  navigate('/register');
                  setFormError('');
                }}
                className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'signup'
                    ? 'border-teal-400 text-teal-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 pb-8">
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={loginData.username}
                    onChange={handleLoginChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-md bg-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-md bg-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    required
                  />
                </div>

                {(formError || error) && (
                  <div className="text-red-400 text-sm text-center">
                    {formError || error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-md font-medium text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#4ade80' }}
                >
                  {isSubmitting ? 'Signing in...' : 'Submit'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-xs text-gray-400 hover:text-gray-300 uppercase tracking-wide"
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={registerData.username}
                    onChange={handleRegisterChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-md bg-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-md bg-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-md bg-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    required
                  />
                </div>

                {(formError || error) && (
                  <div className="text-red-400 text-sm text-center">
                    {formError || error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-md font-medium text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#4ade80' }}
                >
                  {isSubmitting ? 'Creating Account...' : 'Submit'}
                </button>
              </form>
            )}

            {/* Back to Home Link */}
            <div className="text-center mt-6">
              <Link
                to="/"
                className="text-xs text-gray-400 hover:text-gray-300 uppercase tracking-wide"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
