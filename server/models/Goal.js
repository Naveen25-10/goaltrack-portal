const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  thrustArea: { type: String },
  uomType: { 
    type: String, 
    enum: ['Numeric Min', 'Numeric Max', 'Percentage', 'Timeline', 'Zero-based'], 
    required: true 
  },
  target: { type: String, required: true }, // Stored as string to handle timeline (dates) and numbers
  weightage: { type: Number, required: true, min: 10, max: 100 },
  isShared: { type: Boolean, default: false },
  sharedGoalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null },
  status: { type: String, enum: ['Draft', 'Submitted', 'Approved', 'Rejected'], default: 'Draft' },
  managerComments: { type: String },
  isLocked: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
