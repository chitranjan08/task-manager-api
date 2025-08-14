const User = require('../models/User');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../utils/errorCodes');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// GET /api/users - Get all active users
const getAllUsers = async (req, res, next) => {
  try{
  const users = await User.find({}, {name:1,email:1,role:1});
  res.status(200).json({ success: true, users });
  }catch(err){
    next(err)
  }
};

const getProfile = async(req,res, next)=>{
  try{
   const user = await User.findOne({ _id:new mongoose.Types.ObjectId(req.user.userId) },{name:1,email:1,role:1,avatar:1});
    if (!user) {
      return next(new AppError('Assigned user not found', 404, ERROR_CODES.USER_NOT_FOUND));
    }
    res.status(200).json({data:user})
  }catch(err){
logger.error('❌ Login error: %o', err);
    next(err);
  }
}
// GET /api/users/:id - Get user by ID
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.status(200).json({ success: true, user });
};

// POST /api/users/edit-profile - Edit current user's profile (name, email)
const fs = require("fs");
const path = require("path");

const editProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, email, removeAvatar } = req.body;
    const avatarFile = req.file;

    if (!name || !email) {
      return next(new AppError('Name and email are required', 400, ERROR_CODES.VALIDATION_ERROR));
    }

    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return next(new AppError('Email already in use', 409, ERROR_CODES.EMAIL_ALREADY_EXISTS));
    }

    // Fetch current user to check for old avatar
    const currentUser = await User.findById(userId);

    const updateObj = { name, email };

    if (avatarFile) {
      // Remove old avatar if exists
      if (currentUser.avatar) {
        currentUser.avatar = null; // clear old base64
      }

      // Read the file into memory
      const filePath = path.join(__dirname, "..", "uploads", avatarFile.filename);
      const fileData = fs.readFileSync(filePath);

      // Convert to base64 with MIME type
      const base64Image = `data:${avatarFile.mimetype};base64,${fileData.toString("base64")}`;

      // Store new base64 image
      updateObj.avatar = base64Image;

      // Delete temp file
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });

    } else if (removeAvatar === "true" || removeAvatar === true) {
      // Remove avatar if requested
      updateObj.avatar = null;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateObj,
      { new: true, runValidators: true, select: 'name email role avatar' }
    );

    if (!updatedUser) {
      return next(new AppError('User not found', 404, ERROR_CODES.USER_NOT_FOUND));
    }

    res.status(200).json({ success: true, user: updatedUser });

  } catch (err) {
    logger.error('❌ Edit profile error: %o', err);
    next(err);
  }
};



// PUT /api/users/:id - Update role or status
const updateUser = async (req, res) => {
  const { role, isActive } = req.body;
  const updates = {};
  if (role) updates.role = role;
  if (typeof isActive === 'boolean') updates.isActive = isActive;

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.status(200).json({ success: true, user });
};

// DELETE /api/users/:id - Soft delete user
const deleteUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.status(200).json({ success: true, message: 'User deactivated' });
};

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const regex = new RegExp(q, 'i');
    const users = await User.find({
      $or: [{ name: regex }, { email: regex }]
    }).select('name email');

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
module.exports = {
    deleteUser,
    updateUser,
    getUserById,
    getAllUsers,
    getProfile,
    editProfile,
    searchUsers
}