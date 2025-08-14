const express = require('express');
const { sendMessage, getMessages } = require('../controllers/messageController');
const router = express.Router();

router.post('/:chatId/messages', sendMessage);
router.get('/:chatId/messages', getMessages);

module.exports = router;
