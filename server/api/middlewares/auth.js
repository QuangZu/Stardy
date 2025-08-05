const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        console.log('[Auth] Authentication attempt:', {
            hasAuthHeader: !!authHeader,
            hasToken: !!token,
            tokenPreview: token ? token.substring(0, 20) + '...' : 'null',
            jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Missing'
        });

        if (!token) {
            console.log('[Auth] No token provided');
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error('[Auth] JWT_SECRET not configured');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error'
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.error("[Auth] JWT Verification Error:", {
                    error: err.message,
                    name: err.name,
                    tokenPreview: token.substring(0, 20) + '...'
                });
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or expired token',
                    error: process.env.NODE_ENV === 'development' ? err.message : undefined
                });
            }

            console.log('[Auth] Token verified successfully:', {
                userId: user.userId,
                email: user.email,
                role: user.role
            });

            req.user = user;
            next();
        });
    } catch (error) {
        console.error("[Auth] Authentication Error:", error);
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

        console.log('[Auth] Role check:', {
            userRole: req.user.role,
            allowedRoles: allowedRoles,
            userId: req.user.id,
            hasRole: req.user.role && allowedRoles.includes(req.user.role)
        });

        // Check if user has required role (assuming user object has role property)
        if (req.user.role && allowedRoles.includes(req.user.role)) {
            next();
        } else {
            console.warn('[Auth] Access denied:', {
                userRole: req.user.role,
                requiredRoles: allowedRoles,
                userId: req.user.id
            });
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                details: process.env.NODE_ENV === 'development' ? {
                    userRole: req.user.role,
                    requiredRoles: allowedRoles
                } : undefined
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