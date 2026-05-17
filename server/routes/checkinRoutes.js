const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Checkin = require('../models/Checkin');
const Goal = require('../models/Goal');
const { simulateNotification } = require('../utils/logger');

const router = express.Router();

// Get checkins for logged-in employee
router.get('/', protect, async (req, res) => {
  try {
    const checkins = await Checkin.find({ employeeId: req.user._id }).populate('goalId');
    res.json(checkins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create/Update checkin
router.post('/', protect, authorize('Employee'), async (req, res) => {
  try {
    const { goalId, quarter, actualAchievement, status, employeeComment } = req.body;
    
    const goal = await Goal.findById(goalId);
    if (!goal || goal.employeeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized or goal not found' });
    }

    // Progress calculation
    let progressScore = 0;
    const targetNum = parseFloat(goal.target);
    const actualNum = parseFloat(actualAchievement);

    if (goal.uomType.includes('Min')) {
      progressScore = Math.min((actualNum / targetNum) * 100, 100);
    } else if (goal.uomType.includes('Max')) {
      progressScore = Math.min((targetNum / actualNum) * 100, 100);
    } else if (goal.uomType === 'Zero-based') {
      progressScore = actualNum === 0 ? 100 : 0;
    } else if (goal.uomType === 'Percentage') {
       progressScore = Math.min(actualNum, 100);
    } else {
       // Timeline logic simplified for hackathon
       progressScore = status === 'Completed' ? 100 : 50;
    }

    let checkin = await Checkin.findOne({ goalId, quarter });
    
    if (checkin) {
      checkin.actualAchievement = actualAchievement;
      checkin.status = status;
      checkin.employeeComment = employeeComment;
      checkin.progressScore = progressScore;
      await checkin.save();
    } else {
      checkin = await Checkin.create({
        goalId,
        employeeId: req.user._id,
        managerId: goal.managerId,
        quarter,
        actualAchievement,
        status,
        employeeComment,
        progressScore
      });
    }

    // --- SHARED GOAL SYNC ---
    if (goal.isShared) {
      // Find all other identical shared goals
      const sharedGoals = await Goal.find({
        title: goal.title,
        managerId: goal.managerId,
        isShared: true,
        _id: { $ne: goal._id }
      });

      for (let sGoal of sharedGoals) {
        let sCheckin = await Checkin.findOne({ goalId: sGoal._id, quarter });
        if (sCheckin) {
          sCheckin.actualAchievement = actualAchievement;
          sCheckin.status = status;
          sCheckin.employeeComment = employeeComment;
          sCheckin.progressScore = progressScore;
          await sCheckin.save();
        } else {
          await Checkin.create({
            goalId: sGoal._id,
            employeeId: sGoal.employeeId,
            managerId: sGoal.managerId,
            quarter,
            actualAchievement,
            status,
            employeeComment,
            progressScore
          });
        }
      }
    }

    res.status(200).json(checkin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Manager: Get checkins for team
router.get('/team', protect, authorize('Manager'), async (req, res) => {
  try {
    const checkins = await Checkin.find({ managerId: req.user._id })
      .populate('goalId', 'title target uomType weightage')
      .populate('employeeId', 'name');
    res.json(checkins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Manager: Review a checkin
router.put('/:id/review', protect, authorize('Manager'), async (req, res) => {
  try {
    const checkin = await Checkin.findById(req.params.id).populate('employeeId', 'email name');
    if (!checkin || checkin.managerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized or not found' });
    }

    checkin.managerComment = req.body.managerComment;
    checkin.isReviewed = true;
    await checkin.save();
    
    simulateNotification(
      checkin.employeeId.email, 
      'Check-in Feedback', 
      'Manager Reviewed Your Check-in', 
      `Your manager left feedback on your Q${checkin.quarter} update.`
    );

    res.json(checkin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
