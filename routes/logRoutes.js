// routes/logRoutes.js
const express = require('express');
const router = express.Router();
const { getAllLogs, getUserLogs } = require('../controllers/logController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// Admin: get all logs
router.get('/admin', protect, authorizeRoles('admin'), getAllLogs);

// User: get own logs
router.get('/me', protect, getUserLogs);

module.exports = router;
