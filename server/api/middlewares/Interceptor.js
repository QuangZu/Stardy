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

const helmetOption = {
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "https:", "http:"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'", "https:", "http:"],
            frameSrc: ["'none'"]
        }
    }
};

const corsOptions = {
    origin: function (origin, callback) {
        console.log('[CORS] Request from origin:', origin);

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            console.log('[CORS] No origin provided, allowing request');
            return callback(null, true);
        }

        const allowedOrigins = [
            'http://localhost:8080',
            'http://localhost:3000',
            'http://localhost:5173', // Vite dev server
            'https://stardy.vercel.app',
            'https://stardy-3old.onrender.com'
        ];

        // In development, be more permissive
        if (process.env.NODE_ENV === 'development') {
            // Allow any localhost origin in development
            if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                console.log('[CORS] Development mode: allowing localhost origin:', origin);
                return callback(null, true);
            }
        }

        // Check for exact match or Vercel preview deployments
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            console.log('[CORS] Origin allowed:', origin);
            callback(null, true);
        } else {
            console.warn('[CORS] Origin blocked:', origin);
            console.warn('[CORS] Allowed origins:', allowedOrigins);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    preflightContinue: false
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
                const sanitizedKey = key.replace(/[$]/g, '_');
                sanitized[sanitizedKey] = typeof value === 'object' && value !== null 
                    ? sanitizeObject(value, excludeFields) 
                    : typeof value === 'string' 
                        ? value.replace(/[$]/g, '_')
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
    helmet: helmet(helmetOption),
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
