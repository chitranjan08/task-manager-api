const messageService = require('../services/messageService');
const chatService = require('../services/chatService');
const auditLogService = require('../services/auditLogService');

exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    const message = await messageService.createMessage(chatId, userId, text);
    await auditLogService.logMessageSent(message);

    // Emit to chat members
    const io = req.app.get('io');
    const onlineUsers = req.app.get('onlineUsers');
    const members = await chatService.getChatMembers(chatId);

    members.forEach((memberId) => {
      const sockets = onlineUsers.get(memberId.toString());
      if (sockets) {
        sockets.forEach((sockId) => {
          io.to(sockId).emit('receiveMessage', message);
        });
      }
    });

    res.status(201).json(message);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { before, limit = 50 } = req.query;

    const messages = await messageService.getMessages(chatId, before, limit);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
