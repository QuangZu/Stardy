const express = require('express');
const app = express();
const path = require('path');

require('dotenv').config();
const { port } = require('./api/config/environment');

// Database connection
require('./api/config/database');

// Middleware
const {
    helmet,
    cors,
    compression,
    rateLimiters,
    speedLimiter,
    healthCheck,
    errorRecovery,
    requestLogger,
    sanitizeRequest,
    responseTime
} = require('./api/middlewares/Interceptor');
const { globalErrorHandler } = require('./api/middlewares/errorHandler');

// Apply security and performance middleware
app.use(helmet);
app.use(cors);
app.use(compression);
app.use(requestLogger);
app.use(responseTime);
app.use(healthCheck);
app.use(sanitizeRequest);

// Apply general rate limiting
app.use(rateLimiters.general);

// Apply speed limiting to slow down excessive requests
app.use(speedLimiter);

// Apply specific rate limiting for different routes
app.use('/api/auth', rateLimiters.auth);
app.use('/api', rateLimiters.api);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads and avatars with CORS headers
app.use('/uploads', (req, res, next) => {
    // Set CORS headers for static files
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
}, express.static(path.join(__dirname, 'uploads')));

app.use('/avatars', (req, res, next) => {
    // Set CORS headers for avatar files
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
}, express.static(path.join(__dirname, 'uploads', 'avatars')));

app.use(express.static(path.join(__dirname, 'public')));

// Specific route for avatar images with enhanced CORS
app.get('/uploads/avatars/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', 'avatars', filename);

    // Set comprehensive CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');

    // Check if file exists
    if (require('fs').existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'Avatar not found' });
    }
});

// Routes
const router = require('./api/routes/index');
router(app);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Changed from app.all('*', ...) to app.all('/*catchall', ...)
app.all('/*catchall', (req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    err.status = 'fail';
    err.statusCode = 404;
    next(err);
});

// Apply fault tolerance error recovery
app.use(errorRecovery);

// Global error handling middleware
app.use(globalErrorHandler);

// Start server
app.listen(port, () => {
    console.log(`🚀 Server is running on port http://localhost:${port}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log('❌ Unhandled Promise Rejection:', err.message);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log('❌ Uncaught Exception:', err.message);
    process.exit(1);
});
