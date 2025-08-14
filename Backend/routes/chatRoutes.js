const express = require('express');
const { createDirectChat, createGroupChat } = require('../controllers/chatController');
const router = express.Router();

router.post('/direct', createDirectChat);
router.post('/group', createGroupChat);

module.exports = router;
