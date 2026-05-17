const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const { protect } = require('../middleware/auth');
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('managerId', 'name email');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Forgot password (mock)
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email address.' });

    // Mock: log to terminal instead of real email
    const mockResetLink = `http://localhost:5175/reset-password?token=MOCK_TOKEN_${Date.now()}`;
    console.log('\n-----------------------------------------');
    console.log('📧 MOCK PASSWORD RESET EMAIL SENT');
    console.log(`To: ${email}`);
    console.log(`Subject: Reset your AtomQuest Password`);
    console.log(`Body: Click the link to reset your password: ${mockResetLink}`);
    console.log('-----------------------------------------\n');

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

