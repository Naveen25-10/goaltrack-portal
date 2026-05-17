const AuditLog = require('../models/AuditLog');

const simulateNotification = (userEmail, type, title, message) => {
  console.log('\n-----------------------------------------');
  console.log(`📧 MOCK ${type} NOTIFICATION SENT`);
  console.log(`To: ${userEmail}`);
  console.log(`Subject: ${title}`);
  console.log(`Body: ${message}`);
  console.log('-----------------------------------------\n');
};

const createAuditLog = async (goalId, changedBy, fieldChanged, previousValue, newValue, actionType) => {
  try {
    await AuditLog.create({
      goalId,
      changedBy,
      fieldChanged,
      previousValue,
      newValue,
      actionType
    });
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
};

module.exports = { simulateNotification, createAuditLog };
