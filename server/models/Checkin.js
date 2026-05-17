const mongoose = require('mongoose');

const checkinSchema = new mongoose.Schema({
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
  actualAchievement: { type: String, required: true },
  progressScore: { type: Number, default: 0 },
  status: { type: String, enum: ['Not Started', 'On Track', 'Completed'], default: 'Not Started' },
  employeeComment: { type: String },
  managerComment: { type: String },
  isReviewed: { type: Boolean, default: false }
}, { timestamps: true });

// Ensure unique checkin per goal per quarter
checkinSchema.index({ goalId: 1, quarter: 1 }, { unique: true });

module.exports = mongoose.model('Checkin', checkinSchema);
