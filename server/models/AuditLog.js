const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fieldChanged: { type: String, required: true },
  previousValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  actionType: { type: String, enum: ['Update', 'Unlock', 'Approval', 'Rejection'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
