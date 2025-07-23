/* eslint-disable consistent-return */
const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../utils/errorCodes');
const logger = require('../utils/logger');
const logActivity = require('../middlewares/activityLogger')

const createTask = async (req, res, next) => {
  try {
    console.log(req.body)
    const { title, description, assignedTo, dueDate, priority } = req.body;

    // 🔍 Validate assigned user exists
    const assignedUser = await User.findOne({ email: assignedTo });
    if (!assignedUser) {
      return next(new AppError('Assigned user not found', 404, ERROR_CODES.USER_NOT_FOUND));
    }

    // 📝 Create the task
    const task = await Task.create({
      title,
      description,
      assignedTo: assignedUser._id,
      createdBy: req.user.userId,
      dueDate,
      priority,
    });

    logger.info(`✅ Task created and assigned to ${assignedTo} by ${req.user.userId}`);
    await logActivity({
      userId: req.user._id,
      action: 'CREATE_TASK',
      description: `Task created: ${task.title}`,
      req,
    });
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (err) {
    console.log(err)
    logger.error('❌ Error creating task: %o', err);
    next(err);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { role, userId } = req.user;
    const { email } = req.query; // optional for admin filter

    const query = {};

    if (role === 'admin') {
      if (email) {
        const user = await User.findOne({ email }, { _id: 1 });
        if (!user) {
          return next(
            new AppError('User not found for filtering', 404, ERROR_CODES.USER_NOT_FOUND)
          );
        }
        query.assignedTo = user._id;
      }
    } else {
      // Only show tasks assigned to the current user
      query.assignedTo = new mongoose.Types.ObjectId(userId);
    }

    const tasks = await Task.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: 'users',
          foreignField: '_id',
          localField: 'assignedTo',
          as: 'users',
        },
      },
      {
        $unwind: '$users',
      },

      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          priority: 1,
          status: 1,
          dueDate: 1,
          createdAt: 1,
          assignedTo: '$users.name',
          email: '$users.email',
        },
      },
      {
        $sort: {
          dueDate: -1,
        },
      },
    ]);

    console.log(tasks);
    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (err) {
    logger.error('❌ Failed to get tasks: %o', err);
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id, assignedTo, ...rest } = req.body; // separate assignedTo for special handling
    const { role, userId } = req.user;

    // 1. Validate task ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid task ID', 400, ERROR_CODES.MONGO_CAST_ERROR));
    }

    // 2. Fetch task
    const task = await Task.findById(id);
    if (!task) {
      return next(new AppError('Task not found', 404, ERROR_CODES.TASK_NOT_FOUND));
    }

    // 3. Authorization
    const isAdmin = role === 'admin';
    const isAssignedToUser = task.assignedTo.toString() === userId;

    if (!isAdmin && !isAssignedToUser) {
      return next(new AppError('Unauthorized to update this task', 403, ERROR_CODES.UNAUTHORIZED));
    }

    // 4. Prepare update fields
    const updates = { ...rest }; // title, description, etc.

    if (assignedTo) {
      const newUser = await User.findOne({ email: assignedTo });
      if (!newUser) {
        return next(new AppError('Assigned user not found', 404, ERROR_CODES.USER_NOT_FOUND));
      }
      updates.assignedTo = newUser._id;
    }

    // 5. Update task
    const updated = await Task.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    logger.info(`📝 Task ${id} updated by ${role} (${userId})`);
    await logActivity({
      userId: req.user._id,
      action: 'UPDATE_TASK',
      description: `Task updated: ${task.title}`,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: updated,
    });
  } catch (err) {
    logger.error('❌ Update task error: %o', err);
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.body;
    const { role, userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid task ID', 400, ERROR_CODES.MONGO_CAST_ERROR));
    }

    const task = await Task.findById(id);
    if (!task || task.isDeleted) {
      return next(
        new AppError('Task not found or already deleted', 404, ERROR_CODES.TASK_NOT_FOUND)
      );
    }

    const isAdmin = role === 'admin';
    const isAssignedToUser = task.assignedTo.toString() === userId;

    if (!isAdmin && !isAssignedToUser) {
      return next(new AppError('Unauthorized to delete this task', 403, ERROR_CODES.UNAUTHORIZED));
    }

    task.isDeleted = true;
    await task.save();

    logger.info(`🗑️ Task ${id} soft-deleted by ${role} (${userId})`);
      await logActivity({
      userId: req.user._id,
      action: 'DELETE_TASK',
      description: `Task deleted: ${task.title}`,
      req,
      });
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (err) {
    logger.error('❌ Delete task error: %o', err);
    next(err);
  }
};
module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
