import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendVerificationEmail } from '../utils/email.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashed = await bcrypt.hash(password, 12);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await User.create({
            name,
            email,
            password: hashed,
            verificationToken,
        });

        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (err) {
            console.error('Email send failed:', err.message);
        }

        res.status(201).json({
            message: 'Registration successful! Please check your email to verify.',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify Email
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully! You can now login.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Helper to record / increment daily activity count & streak
const recordUserActivity = async (user) => {
    const today = new Date().toISOString().split('T')[0];
    const last = user.lastActive ? user.lastActive.toISOString().split('T')[0] : null;

    if (last !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (last === yesterday) {
            user.streak += 1;
        } else {
            user.streak = 1;
        }

        if (user.streak > user.maxStreak) {
            user.maxStreak = user.streak;
        }
    }

    // Add or increment activity count for today
    const existingActivity = user.activity.find((a) => a.date === today);
    if (existingActivity) {
        existingActivity.count = (existingActivity.count || 1) + 1;
    } else {
        user.activity.push({ date: today, count: 1 });
        user.totalActiveDays += 1;
    }

    user.lastActive = new Date();
    user.markModified('activity');
    await user.save();
    return user;
};



// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Record activity & update user
        await recordUserActivity(user);

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                streak: user.streak,
                maxStreak: user.maxStreak,
                totalActiveDays: user.totalActiveDays,
                activity: user.activity,
            },
        });
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({
            message: err.message,
            error: err
        });
    }
});

// Record activity explicitly (e.g. room join, coding, drawing)
router.post('/activity', async (req, res) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) return res.status(401).json({ message: 'No token' });

        const token = auth.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await recordUserActivity(user);
        res.json({
            message: 'Activity recorded',
            activity: user.activity,
            streak: user.streak,
            maxStreak: user.maxStreak,
            totalActiveDays: user.totalActiveDays,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) return res.status(401).json({ message: 'No token' });

        const token = auth.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password -verificationToken');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Record session activity when loading /me
        await recordUserActivity(user);

        res.json(user);
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});
export default router;