const express = require('express');

const router = express.Router();
const taskController = require('../controllers/taskController');
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const ValidateSchema = require('../validators/taskValidator');
const { ROLES } = require('../utils/constants');

// 🛡️ Only admin or manager can create a task
(router.post(
  '/create',
  verifyToken,
  authorizeRoles(ROLES.ADMIN, ROLES.MANAGER),
  validate(ValidateSchema.taskSchema)
), // Optional: If you're validating creationtaskController.createTask);
  // 👁️ All authenticated users can view tasks (admin/user behavior handled in controller)
  router.get('/', verifyToken, taskController.getTasks));

// 📝 Anyone with access can update their task (controller handles RBAC)
router.post(
  '/update',
  verifyToken,
  validate(ValidateSchema.updateTaskSchema),
  taskController.updateTask
);

router.post('/delete', verifyToken, taskController.deleteTask);
module.exports = router;
