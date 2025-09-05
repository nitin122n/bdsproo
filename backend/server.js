const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('./config/passport');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const transactionRoutes = require('./routes/transactions');
const paymentRoutes = require('./routes/payments');
const depositRoutes = require('./routes/deposits');
const reportRoutes = require('./routes/reports');
const investmentRoutes = require('./routes/investments');
const referralRoutes = require('./routes/referrals');
const { processGrowthManually, scheduleGrowthProcessing } = require('./services/growthProcessor');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});
app.use(limiter);

// CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.CORS_ORIGIN,
    process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // In development, allow any localhost
        if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
            return callback(null, true);
        }
        
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'demo_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const dbConnected = await testConnection();
        res.json({
            success: true,
            message: 'BDS PRO API is running',
            timestamp: new Date().toISOString(),
            database: dbConnected ? 'connected' : 'disconnected',
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// Growth processing endpoint (for manual testing)
app.post('/api/growth/process', processGrowthManually);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/referrals', referralRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// Start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        
        if (dbConnected) {
            console.log('💰 Payment system initialized with real database');
        } else {
            console.log('💰 Payment system running in temporary demo mode');
        }
        
        app.listen(PORT, () => {
            console.log(`🚀 BDS PRO API server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
            console.log(`💰 Payment system initialized with blockchain watcher`);
            console.log(`📊 Database: ${dbConnected ? 'Connected to MySQL (XAMPP)' : 'Demo mode (temporary)'}`);
            
            // Schedule growth processing (6% monthly growth)
            scheduleGrowthProcessing();
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
