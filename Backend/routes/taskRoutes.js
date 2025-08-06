const express = require('express');

const router = express.Router();
const taskController = require('../controllers/taskController');
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const ValidateSchema = require('../validators/taskValidator');
const logActivity = require('../middlewares/activityLogger');
const { ROLES } = require('../utils/constants');
const {globalLimiter} = require("../middlewares/rateLimiter")

// 🛡️ Only admin or manager can create a task
router.post('/create',verifyToken,authorizeRoles(ROLES.ADMIN, ROLES.MANAGER),validate(ValidateSchema.taskSchema),globalLimiter, taskController.createTask);
  
// 👁️ All authenticated users can view tasks (admin/user behavior handled in controller)
 router.get('/', verifyToken, taskController.getTasks);

// 📝 Anyone with access can update their task (controller handles RBAC)
router.post('/update',verifyToken,validate(ValidateSchema.updateTaskSchema),globalLimiter,taskController.updateTask);

router.post('/delete', verifyToken,globalLimiter, taskController.deleteTask);
module.exports = router;
