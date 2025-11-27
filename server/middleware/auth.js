/**
 * JWT Authentication Middleware
 * Verifies Bearer token from Authorization header
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided. Authorization denied.',
                msg: 'Authentication required'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found',
                    msg: 'Invalid token'
                });
            }

            req.user = user;
            next();
        } catch (tokenError) {
            if (tokenError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token expired',
                    msg: 'Please log in again'
                });
            }
            
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token',
                msg: 'Token verification failed'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during authentication',
            msg: error.message
        });
    }
};

module.exports = authMiddleware;



