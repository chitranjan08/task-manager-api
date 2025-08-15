const express = require('express');
const { sendMessage, getMessages } = require('../controllers/messageController');
const verifyToken = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(verifyToken);

router.post('/:chatId/messages', sendMessage);
router.get('/:chatId/messages', getMessages);

module.exports = router;
