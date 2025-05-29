const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { testConnection, syncDatabase } = require('./models');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const sparePartsRoutes = require('./routes/spareParts');
const stockInRoutes = require('./routes/stockIn');
const stockOutRoutes = require('./routes/stockOut');
const reportsRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'sims-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/spare-parts', sparePartsRoutes);
app.use('/api/stock-in', stockInRoutes);
app.use('/api/stock-out', stockOutRoutes);
app.use('/api/reports', reportsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SIMS Backend is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    error: {
      status: 404,
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    },
    availableEndpoints: {
      auth: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'POST /api/auth/logout',
        'GET /api/auth/me'
      ],
      spareParts: [
        'POST /api/spare-parts',
        'GET /api/spare-parts'
      ],
      stockIn: [
        'POST /api/stock-in'
      ],
      stockOut: [
        'GET /api/stock-out',
        'POST /api/stock-out',
        'PUT /api/stock-out/:id',
        'DELETE /api/stock-out/:id'
      ],
      reports: [
        'GET /api/reports/daily-stock-out?date=YYYY-MM-DD',
        'GET /api/reports/daily-stock-status?date=YYYY-MM-DD',
        'GET /api/reports/stock-movement-summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD'
      ],
      health: [
        'GET /api/health'
      ]
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database models
    await syncDatabase();

    // Start the server
    app.listen(PORT, () => {
      console.log(`SmartPark SIMS Backend server running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api/health`);
      console.log(`Default login: username=admin, password=admin123`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
