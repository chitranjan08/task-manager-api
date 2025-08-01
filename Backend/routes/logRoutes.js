// routes/logRoutes.js
const express = require('express');
const router = express.Router();
const { getAllLogs, getUserLogs,createLog,getTaskLogs } = require('../controllers/logController');
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

// Admin: get all logs
router.get('/admin', verifyToken, authorizeRoles('admin'), getAllLogs);

// User: get own logs
router.get('/me', verifyToken, getUserLogs);

router.get('/task-logs', verifyToken, getTaskLogs);

router.post('/create', verifyToken, createLog);
module.exports = router;
