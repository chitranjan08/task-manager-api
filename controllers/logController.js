// controllers/logController.js
const ActivityLog = require('../models/ActivityLog');

// GET /api/logs/admin
const getAllLogs = async (req, res) => {
  const { user, action, startDate, endDate } = req.query;

  const filter = {};
  if (user) filter.user = user;
  if (action) filter.action = action;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const logs = await ActivityLog.find(filter).populate("user", "email role");
  res.json({ success: true, count: logs.length, data: logs });
};

// GET /api/logs/me
const getUserLogs = async (req, res) => {
  const logs = await ActivityLog.find({ user: req.user._id });
  res.json({ success: true, count: logs.length, data: logs });
};

module.exports={
    getAllLogs,
    getUserLogs
}