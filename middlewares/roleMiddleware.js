// middlewares/roleMiddleware.js

const AppError = require('../utils/AppError');
const ERROR_CODES = require('../utils/errorCodes');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('Access denied: insufficient permissions', 403, ERROR_CODES.ACCESS_DENIED));
    }
    next();
  };
};

module.exports = authorizeRoles;
