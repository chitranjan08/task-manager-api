const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../utils/errorCodes');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if token exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Access token missing', 401, ERROR_CODES.TOKEN_MISSING));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (err) {
    return next(new AppError('Invalid or expired access token', 401, ERROR_CODES.TOKEN_INVALID));
  }
};

module.exports = verifyToken;
