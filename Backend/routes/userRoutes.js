const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const { ROLES } = require('../utils/constants');


router.get('/',verifyToken, authorizeRoles(ROLES.ADMIN), userController.getAllUsers);
router.get('/profile',verifyToken, userController.getProfile);
const upload = require('../middlewares/multer');
router.post('/edit-profile', verifyToken, upload.single('avatar'), userController.editProfile);
router.get('/:id',verifyToken, authorizeRoles, userController.getUserById);
router.post('/:id', verifyToken,authorizeRoles,userController.updateUser);
router.post('/:id',verifyToken,authorizeRoles, userController.deleteUser);

module.exports = router;
