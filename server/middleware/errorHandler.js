/**
 * Global Error Handler Middleware
 * Standardizes error responses across the API
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            error: messages.join(', '),
            msg: 'Validation failed'
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            success: false,
            error: `Duplicate ${field} value`,
            msg: `This ${field} already exists`
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token',
            msg: 'Authentication failed'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Token expired',
            msg: 'Please log in again'
        });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Invalid ID format',
            msg: 'Invalid resource ID'
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Server error',
        msg: err.message || 'Something went wrong'
    });
};

module.exports = errorHandler;



