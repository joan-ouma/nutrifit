/**
 * Auth Controller
 * Handles authentication: register, login, get current user
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register new user
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username, email, and password are required',
                msg: 'Please provide all required fields'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters',
                msg: 'Password too short'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User already exists',
                msg: existingUser.email === email 
                    ? 'Email already registered' 
                    : 'Username already taken'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            pantry: [],
            goals: 'balanced',
            budgetLevel: 'medium'
        });

        // Generate token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'your-secret-key-change-in-production',
            { expiresIn: '7d' }
        );

        // Return user data (without password)
        const userData = user.toObject();
        delete userData.password;

        res.status(201).json({
            success: true,
            token,
            user: userData,
            msg: 'Registration successful'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            msg: 'Registration failed'
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password required',
                msg: 'Please provide email and password'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                msg: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                msg: 'Invalid email or password'
            });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'your-secret-key-change-in-production',
            { expiresIn: '7d' }
        );

        // Return user data (without password)
        const userData = user.toObject();
        delete userData.password;

        res.json({
            success: true,
            token,
            user: userData,
            msg: 'Login successful'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            msg: 'Login failed'
        });
    }
};

// Get current user (protected)
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('favoriteRecipes');

        res.json({
            success: true,
            data: user,
            msg: 'User authenticated'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            msg: 'Failed to get user'
        });
    }
};



