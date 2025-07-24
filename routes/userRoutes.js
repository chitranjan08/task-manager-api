const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');



router.get('/',verifyToken, authorizeRoles, userController.getAllUsers);
router.get('/:id',verifyToken, authorizeRoles, userController.getUserById);
router.post('/:id', verifyToken,authorizeRoles,userController.updateUser);
router.post('/:id',verifyToken,authorizeRoles, userController.deleteUser);

module.exports = router;
