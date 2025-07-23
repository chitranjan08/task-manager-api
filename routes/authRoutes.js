const express = require('express');

const router = express.Router();
const { registerUser, loginUser, refreshAccessToken } = require('../controllers/authController');
 
const validate = require('../middlewares/validateMiddleware');
const ValidateSchema = require('../validators/authValidator');
// @route   POST /api/auth/register
router.post('/register', validate(ValidateSchema.registerSchema), registerUser);

// @route   POST /api/auth/login
router.post('/login', validate(ValidateSchema.loginSchema), loginUser);

router.get('/refresh-token', refreshAccessToken);
module.exports = router;
