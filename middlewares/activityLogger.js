// middlewares/activityLogger.js or utils/logActivity.js

const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ userId, action, description, req }) => {
  await ActivityLog.create({
    user: userId,
    action,
    description,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
};

module.exports = logActivity;
