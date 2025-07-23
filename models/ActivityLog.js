// models/ActivityLog.js
const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true }, // e.g. LOGIN, CREATE_TASK
  description: { type: String },            // human readable
  ip: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);
