const mongoose = require('mongoose');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return {
        status: 'error',
        statusCode: 400,
        message,
        isOperational: true
    };
};

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return {
        status: 'error',
        statusCode: 400,
        message,
        isOperational: true
    };
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return {
        status: 'error',
        statusCode: 400,
        message,
        isOperational: true
    };
};

const handleJWTError = () => {
    return {
        status: 'error',
        statusCode: 401,
        message: 'Invalid token. Please log in again!',
        isOperational: true
    };
};

const handleJWTExpiredError = () => {
    return {
        status: 'error',
        statusCode: 401,
        message: 'Your token has expired! Please log in again.',
        isOperational: true
    };
};

const sendErrorDev = (err, req, res) => {
    // Log error details for debugging
    console.error('🔥 ERROR DETAILS:', {
        timestamp: new Date().toISOString(),
        url: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        error: {
            name: err.name,
            message: err.message,
            stack: err.stack,
            statusCode: err.statusCode,
            status: err.status
        },
        body: req.body,
        params: req.params,
        query: req.query
    });

    return res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        error: err,
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
    });
};

const sendErrorProd = (err, req, res) => {
    // Log error for monitoring (but don't expose to client)
    console.error('🔥 PRODUCTION ERROR:', {
        timestamp: new Date().toISOString(),
        url: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        error: {
            name: err.name,
            message: err.message,
            statusCode: err.statusCode,
            status: err.status,
            isOperational: err.isOperational
        }
    });

    // Operational, trusted error: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode || 500).json({
            status: err.status || 'error',
            message: err.message,
            timestamp: new Date().toISOString()
        });
    }

    // Programming or other unknown error: don't leak error details
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
        timestamp: new Date().toISOString()
    });
};

const globalErrorHandler = (err, req, res, next) => {
    // Set default error properties
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Create a copy of the error for manipulation
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // Handle MongoDB connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
        error = {
            status: 'error',
            statusCode: 503,
            message: 'Database connection error. Please try again later.',
            isOperational: true
        };
    }

    // Send appropriate error response based on environment
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, req, res);
    } else {
        sendErrorProd(error, req, res);
    }
};

// Custom error class for operational errors
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Async error wrapper to catch async errors
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// Request validation middleware
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            const message = error.details.map(detail => detail.message).join(', ');
            return next(new AppError(message, 400));
        }
        next();
    };
};

// Enhanced authentication check
const requireAuth = (req, res, next) => {
    if (!req.user || !req.user.id) {
        return next(new AppError('Authentication required. Please log in.', 401));
    }
    next();
};

// Database connection health check
const checkDatabaseConnection = async (req, res, next) => {
    try {
        // Check if mongoose is connected
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database not connected');
        }
        next();
    } catch (error) {
        next(new AppError('Database connection error', 503));
    }
};

module.exports = {
    globalErrorHandler,
    AppError,
    catchAsync,
    validateRequest,
    requireAuth,
    checkDatabaseConnection
};