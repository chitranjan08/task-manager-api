// controllers/logController.js
const ActivityLog = require('../models/ActivityLog');
const UserModel = require('../models/User');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../utils/errorCodes');
const mongoose = require('mongoose');
const logActivity = require('../middlewares/activityLogger')
const produceNotification = require("../kafka/producer");
const Task = require('../models/Task');

// GET /api/logs/admin
const getAllLogs = async (req, res, next) => {
    try{
  const { email, action, startDate, endDate } = req.query;

   const filter = {};

    // ✅ Step 1: Get _id from email
    if (email) {
      const user = await UserModel.findOne({ email }, { _id: 1 });
      if (!user) {
      return next(new AppError('User not found for filtering', 404, ERROR_CODES.USER_NOT_FOUND));
        
      }
      filter.user = new user._id;
    }

    // ✅ Step 2: Add action/date filters
    if (action) filter.action = action;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
  const pipeline = [
    // Lookup user details
    {
      $match: {
        ...filter,
        
      },
    },
    {
      $lookup: {
        from: "users", // collection name (lowercase plural of model)
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    
    
    {
      $project: {
        _id: 1,
        action: 1,
        description: 1,
        createdAt: 1,
        ip: 1,
        userAgent: 1,
        email: "$user.email",
        name: "$user.name",
        role: "$user.role",
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ];

  const logs = await ActivityLog.aggregate(pipeline);
  res.json({
    success: true,
    count: logs.length,
    data: logs,
  });
}catch(err){
    next(err)
}
};

// GET /api/logs/me
const getUserLogs = async (req, res) => {
    const {email} = req.query
    const filter =  {}
    if (email) {
      const user = await UserModel.findOne({ email }, { _id: 1 });
      if (!user) {
      return next(new AppError('User not found for filtering', 404, ERROR_CODES.USER_NOT_FOUND));
      }
      filter.user = new mongoose.Types.ObjectId(user._id);
    }
  const logs = await ActivityLog.find(filter);
  res.json({ success: true, count: logs.length, data: logs });
};

const createLog = async (req, res, next) => {
  try {
    const { taskId, action, description } = req.body;
    const ip = req.ip;
    const userAgent = req.get('User-Agent');
    const userId = req.user.userId; // Optional, if you're using auth middleware
    if (!taskId || !action || !description) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    const task = await Task.findById(taskId);
    const log = await ActivityLog.create({
      user: new mongoose.Types.ObjectId(userId),
      taskId: new mongoose.Types.ObjectId(taskId),
      action,
      description,
      ip,
      userAgent
    });
    if(action === "STATUS_CHANGE"){
    await produceNotification({
      userId: userId,
      message: `Task status updated: ${task.title}`,
      status: task.status,
      type: "TASK_UPDATED",
      createdAt: new Date().toISOString(),
    });
  }else{
    await produceNotification({
      userId: userId,
      message: `You have logged a new activity on task ${task.title}`,
      type: "TASK_UPDATED",
      createdAt: new Date().toISOString(),
    });
  }
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    console.error('Error creating activity log:', err);
    next(err);
  }
};

const getTaskLogs = async (req, res, next) => {
  const { taskId } = req.query;
  const {userId} = req.user
  const logs = await ActivityLog.find({ taskId: new mongoose.Types.ObjectId(taskId),user:new mongoose.Types.ObjectId(userId) });
  res.json({ success: true, count: logs.length, data: logs });
};

module.exports={
    getAllLogs,
    getUserLogs,
    createLog,
    getTaskLogs
}