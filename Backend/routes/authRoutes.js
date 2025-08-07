const express = require('express');
const passport = require("passport");
const router = express.Router();
const { registerUser, loginUser, forgotPassword,refreshAccessToken,resetPassword } = require('../controllers/authController');
const { generateRefreshToken, generateAccessToken } = require('../utils/generateToken');

const { authLimiter } = require("../middlewares/rateLimiter");

const validate = require('../middlewares/validateMiddleware');
const ValidateSchema = require('../validators/authValidator');
const UserModel = require('../models/User');
const { sendWelcomeEmail } = require('../services/emailService');
// @route   POST /api/auth/register
router.post('/register', validate(ValidateSchema.registerSchema), authLimiter, registerUser);

// @route   POST /api/auth/login
router.post('/login',validate(ValidateSchema.loginSchema), authLimiter,loginUser);

router.post('/forgot-password', forgotPassword)

router.post('/reset-password', resetPassword)

router.post('/refresh-token', refreshAccessToken);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google-callback", passport.authenticate("google", { session: false }), async (req, res) => {
 const token = generateAccessToken(req.user._id, req.user.role);
  const refreshToken = generateRefreshToken(req.user._id);
   await UserModel.findByIdAndUpdate(req.user._id, { refreshToken });

    // Option 1: Send refresh token as HTTP-only cookie (secure)
    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
  res.redirect(`http://localhost:3001/social-login-success?accessToken=${token}`);
});

// Facebook
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));

router.get("/facebook/callback", passport.authenticate("facebook", { session: false }), (req, res) => {
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.redirect(`http://yourfrontend.com/social-login-success?token=${token}`);
});
module.exports = router;
