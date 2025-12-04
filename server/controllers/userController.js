const User = require('../models/User');

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const updateData = req.body;

        delete updateData.password;
        delete updateData._id;
        delete updateData.email;

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

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

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

exports.getSearchHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('searchHistory');
        res.json({
            success: true,
            data: user.searchHistory || [],
            count: user.searchHistory?.length || 0
        });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to fetch history' });
    }
};

exports.saveSearchHistory = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || !query.trim()) {
            return res.status(400).json({ success: false, msg: 'Query required' });
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

        if (user.searchHistory.length > 20) {
            user.searchHistory = user.searchHistory.slice(-20);
            await user.save();
        }

        res.json({ success: true, data: user.searchHistory });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to save search' });
    }
};