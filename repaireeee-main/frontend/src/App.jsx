// React imports
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Cars from './components/cars/Cars';
import Services from './components/services/Services';
import ServiceRecords from './components/serviceRecords/ServiceRecords';
import Reports from './components/reports/Reports';
import NotFound from './components/layout/NotFound';
import Header from './components/layout/Header';

// Context
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <div className="flex-1 container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/cars" element={<PrivateRoute><Cars /></PrivateRoute>} />
              <Route path="/services" element={<PrivateRoute><Services /></PrivateRoute>} />
              <Route path="/service-records" element={<PrivateRoute><ServiceRecords /></PrivateRoute>} />
              <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
