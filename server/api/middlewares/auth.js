const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.error("JWT Verification Error:", err);
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or expired token',
                    error: process.env.NODE_ENV === 'development' ? err.message : undefined
                });
            }
            req.user = user;
            next();
        });
    } catch (error) {
        console.error("Authentication Error:", error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // If roles is a string, convert to array
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        
        // Check if user has required role (assuming user object has role property)
        if (req.user.role && allowedRoles.includes(req.user.role)) {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
    };
};

const requireOwnership = (req, res, next) => {
    const resourceUserId = req.params.userId || req.body.userId;
    
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.id !== resourceUserId) {
        return res.status(403).json({
            success: false,
            message: 'Access denied: You can only access your own resources'
        });
    }

    next();
};

module.exports = {
    authenticate,
    requireRole,
    requireOwnership
};