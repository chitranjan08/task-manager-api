const User = require('../models/User');

// GET /api/users - Get all active users
const getAllUsers = async (req, res) => {
  const users = await User.find({},{email:1,name:1,role:1});
  res.status(200).json({ success: true, users });
};

// GET /api/users/:id - Get user by ID
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.status(200).json({ success: true, user });
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
    getAllUsers
}