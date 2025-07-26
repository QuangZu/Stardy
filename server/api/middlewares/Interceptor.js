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

const corsOptions = {
    origin: function (origin, callback) {
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Added PATCH here
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

const requestLogger = morgan('combined');

const sanitizeRequest = (req, res, next) => {
    const sanitizeObject = (obj, excludeFields = []) => {
        if (typeof obj !== 'object' || obj === null) return obj;
        
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            // Skip sanitization for avatar-related fields and file paths
            if (excludeFields.includes(key) || 
                key.includes('avatar') || 
                key.includes('Avatar') ||
                key.includes('path') ||
                key.includes('url') ||
                key.includes('src')) {
                sanitized[key] = value;
            } else {
                const sanitizedKey = key.replace(/[$]/g, '_'); // Only replace $ not dots
                sanitized[sanitizedKey] = typeof value === 'object' && value !== null 
                    ? sanitizeObject(value, excludeFields) 
                    : typeof value === 'string' 
                        ? value.replace(/[$]/g, '_')  // Only replace $ not dots
                        : value;
            }
        }
        return sanitized;
    };
    
    const excludeFields = ['avatar', 'avatarUrl', 'defaultAvatar', 'path', 'src', 'url', 'filePath'];
    
    if (req.body) {
        req.body = sanitizeObject(req.body, excludeFields);
    }
    
    if (req.query) {
        req.query = sanitizeObject(req.query, excludeFields);
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
