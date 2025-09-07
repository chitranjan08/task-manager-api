const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // password required only if not Google login
      },
      minlength: 6,
    },
    googleId: String,
    avatar : String,
    role: {
      type: String,
      enum: ['admin', 'manager', 'user'],
      default: 'user',
    },
    refreshToken: { type: String },
    googleAccessToken: String,
    googleRefreshToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastSeen: { type: Date, default: null },
  },
  { timestamps: true }
);

// 🔐 Hash password only if present
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next(); // Skip if no password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🧾 Compare entered password with hashed one
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
