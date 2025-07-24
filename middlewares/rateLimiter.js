const rateLimit = require("express-rate-limit");

// Apply to all requests globally
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: {
    status: 429,
    message: "Too many requests. Please try again later.",
  },
});

// More strict limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // max 5 attempts
  message: {
    status: 429,
    message: "Too many login/register attempts. Please wait 10 minutes.",
  },
});

module.exports = {
  globalLimiter,
  authLimiter,
};
