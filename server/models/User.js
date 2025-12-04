/**
 * User Controller
 * Handles user profile updates and search history
 */
const User = require('../models/User');

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const updateData = req.body;

        // Remove password from update data if present
        delete updateData.password;
        delete updateData._id;
        delete updateData.email; // Prevent email changes

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
                msg: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user,
            msg: 'Profile updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            msg: 'Failed to update profile'
        });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password');

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            msg: 'Failed to fetch profile'
        });
    }
};

// Get user search history
exports.getSearchHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('searchHistory');

        res.json({
            success: true,
            data: user.searchHistory || [],
            count: user.searchHistory?.length || 0
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            msg: 'Failed to fetch search history'
        });
    }
};

// Save search history
exports.saveSearchHistory = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || !query.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Search query required',
                msg: 'Please provide a search query'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $push: {
                    searchHistory: {
                        query: query.trim(),
                        timestamp: new Date()
                    }
                }
            },
            { new: true }
        ).select('searchHistory');

        // Keep only last 20 searches
        if (user.searchHistory.length > 20) {
            user.searchHistory = user.searchHistory.slice(-20);
            await user.save();
        }

        res.json({
            success: true,
            data: user.searchHistory,
            msg: 'Search saved'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            msg: 'Failed to save search'
        });
    }
};



