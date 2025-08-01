// utils/notificationService.js
const Notification = require("../models/Notification");

const createNotification = async (userId, message, type = null) => {
  const notification = new Notification({ userId, message, type });
  const messages = await notification.save();
  return messages
};

module.exports = { createNotification };
