const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Goal = require('../models/Goal');
const User = require('../models/User');
const { createAuditLog, simulateNotification } = require('../utils/logger');

const router = express.Router();

// Get goals for logged-in employee
router.get('/', protect, async (req, res) => {
  try {
    const goals = await Goal.find({ employeeId: req.user._id });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create goals (bulk)
router.post('/', protect, authorize('Employee'), async (req, res) => {
  try {
    const goals = req.body.goals; // Array of goals
    if (!goals || goals.length === 0) return res.status(400).json({ message: 'No goals provided' });
    if (goals.length > 8) return res.status(400).json({ message: 'Maximum 8 goals allowed' });
    
    let totalWeightage = 0;
    for (let goal of goals) {
      const weight = Number(goal.weightage);
      if (weight < 10) return res.status(400).json({ message: 'Minimum 10% weightage per goal' });
      totalWeightage += weight;
    }
    
    if (totalWeightage !== 100) return res.status(400).json({ message: 'Total weightage must be exactly 100%' });

    const newGoals = goals.map(g => {
      const { _id, ...goalData } = g; // Strip _id so Mongo generates a new one
      return {
        ...goalData,
        employeeId: req.user._id,
        managerId: req.user.managerId,
        status: 'Submitted'
      };
    });

    // Remove any existing non-locked goals to prevent duplication on re-submission
    await Goal.deleteMany({ employeeId: req.user._id, isLocked: false, status: { $in: ['Draft', 'Submitted', 'Rejected'] } });

    const createdGoals = await Goal.insertMany(newGoals);
    simulateNotification(req.user.email, 'Submission', 'Goal Sheet Submitted', 'Your goal sheet is awaiting manager review.');
    res.status(201).json(createdGoals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Manager: Push a shared goal to team
router.post('/shared', protect, authorize('Manager'), async (req, res) => {
  try {
    const { title, description, thrustArea, uomType, target } = req.body;
    
    // Find all employees reporting to this manager
    const employees = await User.find({ managerId: req.user._id });
    if (employees.length === 0) return res.status(400).json({ message: 'No employees found in your team.' });

    const sharedGoals = employees.map(emp => ({
      title,
      description,
      thrustArea,
      uomType,
      target,
      weightage: 10, // Default minimum
      employeeId: emp._id,
      managerId: req.user._id,
      status: 'Draft', // Employee must accept/adjust and submit
      isShared: true   // Custom flag we can use on frontend
    }));

    await Goal.insertMany(sharedGoals);
    simulateNotification(req.user.email, 'Push Goal', 'Shared Goal Pushed', `Goal pushed to ${employees.length} employees.`);
    res.status(201).json({ message: 'Shared goal pushed to team successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Manager: Get team goals
router.get('/team', protect, authorize('Manager'), async (req, res) => {
  try {
    const goals = await Goal.find({ managerId: req.user._id }).populate('employeeId', 'name email');
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Manager: Update and Approve/Reject
router.put('/:id/review', protect, authorize('Manager'), async (req, res) => {
  try {
    const { status, target, weightage, managerComments } = req.body;
    const goal = await Goal.findById(req.params.id).populate('employeeId', 'email');
    
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    if (goal.managerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    const wasLocked = goal.isLocked;

    if (target && goal.target !== target) {
      if (wasLocked) await createAuditLog(goal._id, req.user._id, 'target', goal.target, target, 'Update');
      goal.target = target;
    }
    if (weightage && goal.weightage !== weightage) {
      if (wasLocked) await createAuditLog(goal._id, req.user._id, 'weightage', goal.weightage.toString(), weightage.toString(), 'Update');
      goal.weightage = weightage;
    }
    if (managerComments) goal.managerComments = managerComments;
    
    if (status && goal.status !== status) {
      if (wasLocked) await createAuditLog(goal._id, req.user._id, 'status', goal.status, status, 'Status Change');
      goal.status = status;
      if (status === 'Approved') {
        goal.isLocked = true;
        simulateNotification(goal.employeeId.email, 'Approval', 'Goal Approved', `Your goal '${goal.title}' has been approved.`);
      }
    }

    await goal.save();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
