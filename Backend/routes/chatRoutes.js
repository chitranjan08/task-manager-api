const express = require('express');
const {
  createDirectChat,
  createGroupChat,
  getUserChats,
} = require('../controllers/chatController');
const verifyToken = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(verifyToken);

router.get('/', getUserChats);
router.post('/direct', createDirectChat);
router.post('/group', createGroupChat);

module.exports = router;
