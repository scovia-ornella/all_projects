import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#faedcd' }}>
          <div className="text-center px-4">
            {/* Error Card */}
            <div className="max-w-md mx-auto rounded-lg shadow-lg p-8" style={{ backgroundColor: '#5a6c7d' }}>
              {/* Error Icon */}
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: '#ef4444' }}>
                  <span className="text-white text-2xl font-bold">!</span>
                </div>
              </div>

              {/* Error Message */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-3">
                  Something went wrong
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="block w-full py-3 px-4 rounded-md font-medium text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#4ade80' }}
                >
                  Refresh Page
                </button>
                
                <Link
                  to="/"
                  className="block w-full py-3 px-4 rounded-md font-medium text-gray-300 border border-gray-500 hover:bg-gray-600 transition-colors"
                >
                  Go to Home
                </Link>
              </div>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-6 pt-6 border-t border-gray-600">
                  <details className="text-left">
                    <summary className="text-xs text-gray-400 uppercase tracking-wide cursor-pointer hover:text-gray-300">
                      Error Details (Dev Mode)
                    </summary>
                    <div className="mt-3 p-3 bg-gray-800 rounded text-xs text-red-300 font-mono overflow-auto max-h-32">
                      <div className="mb-2">
                        <strong>Error:</strong> {this.state.error.toString()}
                      </div>
                      {this.state.errorInfo.componentStack && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="whitespace-pre-wrap text-xs">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}

              {/* Contact Support */}
              <div className="mt-6 pt-6 border-t border-gray-600">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  Need Help?
                </p>
                <a
                  href="mailto:support@smartpark.com"
                  className="block text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Contact Support
                </a>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-center">
              <p className="text-sm" style={{ color: '#023e8a' }}>
                SmartPark Inventory Management System
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
