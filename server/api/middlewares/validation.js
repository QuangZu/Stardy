const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return next(new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400, 'VALIDATION_ERROR'));
    }
    next();
};

// Common validation rules
const validationRules = {
    registerUser: [
        body('username')
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage('Username must be between 3 and 30 characters')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Username can only contain letters, numbers, and underscores'),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    ],

    loginUser: [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email'),
        body('password')
            .notEmpty()
            .withMessage('Password is required')
    ],

    // MongoDB ObjectId validation
    validateObjectId: (paramName) => [
        param(paramName)
            .isMongoId()
            .withMessage(`Invalid ${paramName} format`)
    ],

    // Question/Answer validation
    createQA: [
        body('question')
            .trim()
            .isLength({ min: 10, max: 500 })
            .withMessage('Question must be between 10 and 500 characters'),
        body('answer')
            .trim()
            .isLength({ min: 1, max: 1000 })
            .withMessage('Answer must be between 1 and 1000 characters'),
        body('subjectId')
            .isMongoId()
            .withMessage('Invalid subject ID'),
        body('levelId')
            .isMongoId()
            .withMessage('Invalid level ID')
    ],

    // Exam validation
    createExam: [
        body('title')
            .trim()
            .isLength({ min: 5, max: 100 })
            .withMessage('Exam title must be between 5 and 100 characters'),
        body('description')
            .trim()
            .isLength({ min: 10, max: 500 })
            .withMessage('Exam description must be between 10 and 500 characters'),
        body('questions')
            .isArray({ min: 1 })
            .withMessage('Exam must have at least one question'),
        body('levelRequired')
            .isInt({ min: 1 })
            .withMessage('Level required must be a positive integer'),
        body('passingScore')
            .isInt({ min: 0, max: 100 })
            .withMessage('Passing score must be between 0 and 100')
    ],

    // Pagination validation
    pagination: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100')
    ]
};

module.exports = {
    validationRules,
    handleValidationErrors
};

