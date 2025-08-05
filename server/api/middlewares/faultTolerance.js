const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { RedisStore } = require('rate-limit-redis');
const redis = require('redis');

let redisClient = null;

class CircuitBreaker {
    constructor(options = {}) {
        this.failureThreshold = options.failureThreshold || 5;
        this.resetTimeout = options.resetTimeout || 60000; // 1 minute
        this.monitoringPeriod = options.monitoringPeriod || 10000; // 10 seconds
        
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.successCount = 0;
    }
    
    async execute(operation) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.resetTimeout) {
                this.state = 'HALF_OPEN';
                this.successCount = 0;
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }
        
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }
    
    onSuccess() {
        this.failureCount = 0;
        if (this.state === 'HALF_OPEN') {
            this.successCount++;
            if (this.successCount >= 3) {
                this.state = 'CLOSED';
            }
        }
    }
    
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        
        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
        }
    }
}

// Enhanced rate limiting with different tiers
const createRateLimiter = (options) => {
    const config = {
        windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
        max: options.max || 100,
        message: {
            status: 'error',
            message: options.message || 'Too many requests, please try again later',
            retryAfter: Math.ceil((options.windowMs || 15 * 60 * 1000) / 1000)
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            console.warn(`Rate limit exceeded for ${options.name || 'unknown'}: ${req.ip}`);
            res.status(429).json(config.message);
        },
        skip: (req) => {
            // Skip rate limiting for health checks
            return req.path === '/health' || req.path === '/api/health';
        }
    };
    
    // Use Redis store if available
    if (redisClient) {
        config.store = new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args)
        });
    }
    
    return rateLimit(config);
};

// Different rate limits for different endpoints
const rateLimiters = {
    // General API rate limiting
    general: createRateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // 1000 requests per 15 minutes
        message: 'Too many requests from this IP, please try again in 15 minutes'
    }),
    
    // Strict rate limiting for authentication endpoints
    auth: createRateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10, // 10 login attempts per 15 minutes
        message: 'Too many authentication attempts, please try again in 15 minutes'
    }),
    
    // Moderate rate limiting for API endpoints
    api: createRateLimiter({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 100, // 100 requests per minute
        message: 'API rate limit exceeded, please slow down your requests'
    }),
    
    // Lenient rate limiting for static content
    static: createRateLimiter({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 500, // 500 requests per minute
        message: 'Too many requests for static content'
    })
};

// Speed limiter to slow down requests instead of blocking
const speedLimiter = slowDown({
    windowMs: 1 * 60 * 1000, // 1 minute
    delayAfter: 50, // Allow 50 requests per minute at full speed
    delayMs: (used, req) => {
        const delayAfter = req.slowDown.delayAfter;
        return (used - delayAfter) * 500; // Add 500ms delay per request after delayAfter
    },
    maxDelayMs: 2000, // Maximum delay of 2 seconds
    skipFailedRequests: true,
    skipSuccessfulRequests: false,
    keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress;
    }
});

// Request timeout middleware
const requestTimeout = (timeout = 300000) => { // Increased to 5 minutes for document processing
    return (req, res, next) => {
        const timer = setTimeout(() => {
            if (!res.headersSent) {
                res.status(408).json({
                    status: 'error',
                    message: 'Request timeout'
                });
            }
        }, timeout);
        
        res.on('finish', () => clearTimeout(timer));
        res.on('close', () => clearTimeout(timer));
        
        next();
    };
};

// Health check middleware
const healthCheck = (req, res, next) => {
    if (req.path === '/health' || req.path === '/api/health') {
        return res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    }
    next();
};

// Error recovery middleware
const errorRecovery = (err, req, res, next) => {
    console.error('Error caught by fault tolerance middleware:', err);

    // Handle headers already sent error - just log and return
    if (err.code === 'ERR_HTTP_HEADERS_SENT') {
        console.warn('Headers already sent, cannot send error response');
        return;
    }

    // Handle specific error types
    if (err.code === 'ECONNRESET' || err.code === 'ECONNABORTED') {
        if (!res.headersSent) {
            return res.status(503).json({
                status: 'error',
                message: 'Service temporarily unavailable, please try again',
                code: 'CONNECTION_ERROR'
            });
        }
        return;
    }

    if (err.name === 'ValidationError') {
        if (!res.headersSent) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid request data',
                details: err.message
            });
        }
        return;
    }

    if (err.name === 'CastError') {
        if (!res.headersSent) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid ID format'
            });
        }
        return;
    }

    // Default error response
    if (!res.headersSent) {
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    } else {
        console.warn('Cannot send error response - headers already sent');
    }
};

// Graceful shutdown handler
const gracefulShutdown = () => {
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
    
    signals.forEach(signal => {
        process.on(signal, () => {
            console.log(`Received ${signal}, starting graceful shutdown...`);
            
            // Close Redis connection if exists
            if (redisClient) {
                redisClient.quit();
            }
            
            // Give ongoing requests time to complete
            setTimeout(() => {
                console.log('Graceful shutdown completed');
                process.exit(0);
            }, 5000);
        });
    });
};

// Initialize graceful shutdown
gracefulShutdown();

module.exports = {
    CircuitBreaker,
    rateLimiters,
    speedLimiter,
    requestTimeout,
    healthCheck,
    errorRecovery,
    createRateLimiter
};
