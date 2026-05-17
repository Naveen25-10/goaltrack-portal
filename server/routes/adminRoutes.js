const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Goal = require('../models/Goal');

const router = express.Router();

// Admin: Unlock a goal
router.put('/goals/:id/unlock', protect, authorize('Admin'), async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    goal.isLocked = false;
    goal.status = 'Draft';
    await goal.save();
    res.json({ message: 'Goal unlocked successfully', goal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users
router.get('/users', protect, authorize('Admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('managerId', 'name email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all goals (for reports)
router.get('/reports/goals', protect, authorize('Admin'), async (req, res) => {
  try {
    const goals = await Goal.find()
      .populate('employeeId', 'name department')
      .populate('managerId', 'name');
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const AuditLog = require('../models/AuditLog');

// Get analytics
router.get('/analytics', protect, authorize('Admin'), async (req, res) => {
  try {
    const totalGoals = await Goal.countDocuments();
    const approvedGoals = await Goal.countDocuments({ status: 'Approved' });
    const pendingGoals = await Goal.countDocuments({ status: 'Submitted' });
    
    // Status distribution
    const statusDistribution = [
      { name: 'Draft', value: await Goal.countDocuments({ status: 'Draft' }) },
      { name: 'Submitted', value: pendingGoals },
      { name: 'Approved', value: approvedGoals },
      { name: 'Rejected', value: await Goal.countDocuments({ status: 'Rejected' }) }
    ];

    res.json({
      totalGoals,
      approvedGoals,
      pendingGoals,
      statusDistribution
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get audit logs
router.get('/auditlogs', protect, authorize('Admin'), async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('changedBy', 'name email')
      .populate('goalId', 'title')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
