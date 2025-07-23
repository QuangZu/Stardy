const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const responseTime = require('response-time');
const { 
    rateLimiters, 
    speedLimiter, 
    requestTimeout, 
    healthCheck, 
    errorRecovery 
} = require('./faultTolerance');

// Configure CORS with enhanced options
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:8080',
            'http://localhost:3000',
            'https://stardy.vercel.app',
            'https://stardy-3old.onrender.com'
        ];
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Configure request logger
const requestLogger = morgan('combined');

// Configure sanitization
const sanitizeRequest = (req, res, next) => {
    // Sanitize req.body
    if (req.body) {
        req.body = JSON.parse(JSON.stringify(req.body).replace(/\$/g, '_').replace(/\./g, '_'));
    }
    
    // Sanitize req.query
    if (req.query) {
        const sanitizedQuery = {};
        for (const key in req.query) {
            const sanitizedKey = key.replace(/\$/g, '_').replace(/\./g, '_');
            sanitizedQuery[sanitizedKey] = req.query[key];
        }
        Object.defineProperty(req, 'query', {
            value: sanitizedQuery,
            writable: true,
            enumerable: true,
            configurable: true
        });
    }
    
    next();
};

module.exports = {
    helmet: helmet(),
    cors: cors(corsOptions),
    compression: compression(),
    rateLimiters,
    speedLimiter,
    requestTimeout,
    healthCheck,
    errorRecovery,
    requestLogger,
    sanitizeRequest,
    responseTime: responseTime()
};
