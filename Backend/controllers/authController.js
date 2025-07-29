/* eslint-disable consistent-return */
const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');
const { generateRefreshToken, generateAccessToken } = require('../utils/generateToken');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../utils/errorCodes');
const logger = require('../utils/logger');
const logActivity = require('../middlewares/activityLogger')
require('dotenv').config();
// eslint-disable-next-line consistent-return
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    // Check if user already exist
    
    const userExists = await UserModel.findOne({ email }, { email: 1 });
    
    if (userExists) {
      if (userExists) {
        return next(new AppError('User already exists', 400, ERROR_CODES.USER_ALREADY_EXISTS));
      }
    }
    const user = await UserModel.create({ name, email, password, role });
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();
    logger.info(`New user registered: ${req.body.email}`);
     await logActivity({
      userId: user._id,
      action: 'REGISTER',
      description: 'User registered successfully',
      req,
    });
    res.status(201).json({
      message: 'User registered successfully',
      user: { name: user.name, email: user.email, role: user.role },
      tokens: { accessToken, refreshToken },
    });
  } catch (err) {
    logger.error('Register error: %o', err);
    next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return next(
        new AppError('Invalid email or password', 401, ERROR_CODES.AUTH_INVALID_CREDENTIALS)
      );
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(
        new AppError('Invalid email or password', 401, ERROR_CODES.AUTH_INVALID_CREDENTIALS)
      );
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    logger.info(`🔐 User logged in: ${email}`);
    await logActivity({
    userId: user._id,
    action: 'LOGIN',
    description: 'User logged in successfully',
    req,
    });
    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        message: 'Login successful',
        user: { name: user.name, email: user.email, role: user.role },
        accessToken,
      });
  } catch (err) {
    logger.error('❌ Login error: %o', err);
    next(err);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return next(new AppError('No refresh token provided', 401, ERROR_CODES.TOKEN_MISSING));
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await UserModel.findById(decoded.userId);
    if (!user || user.refreshToken !== token) {
      return next(new AppError('Invalid refresh token', 403, ERROR_CODES.TOKEN_INVALID));
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    logger.error('❌ Refresh token error: %o', err);
    next(err);
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
};
