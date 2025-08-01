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
   const user = await User.findOne({ _id:new mongoose.Types.ObjectId(req.user.userId) });
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
const editProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, email } = req.body; // avatar is expected as base64 string
    const avatarFile = req.file;
    // Validate input
    if (!name || !email) {
      return next(new AppError('Name and email are required', 400, ERROR_CODES.VALIDATION_ERROR));
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return next(new AppError('Email already in use', 409, ERROR_CODES.EMAIL_ALREADY_EXISTS));
    }

    // Prepare update object
    const updateObj = { name, email };
    if (avatarFile) {
      updateObj.avatar = `/uploads/${avatarFile.filename}`;
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

module.exports = {
    deleteUser,
    updateUser,
    getUserById,
    getAllUsers,
    getProfile,
    editProfile
}