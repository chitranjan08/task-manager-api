const messageService = require('../services/messageService');
const chatService = require('../service/chatService');
const auditLogService = require('../services/auditLogService');
const produceNotification = require("../kafka/producer");

exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    // Create message
    let message = await messageService.createMessage(chatId, userId, content);

    // Populate sender info
    message = await message.populate('senderId', 'name avatar email');

    // Emit message to all chat members
    const io = req.app.get('io');
    const onlineUsers = req.app.get('onlineUsers');
    const members = await chatService.getChatMembers(chatId);
    console.log(`members`, members);
    members.forEach((memberId) => {
      const sockets = onlineUsers.get(memberId.toString());
      if (sockets) {
        sockets.forEach((sockId) => {
          io.to(sockId).emit('receiveMessage', message);
        });
      }
    });
   const recipients = members.filter(id => id.toString() !== userId.toString());
    for (const recipientId of recipients) {
      await produceNotification({
        userId: recipientId, // actual recipient
        message: `${message.senderId.name}: ${message.content}`,
        type: "CHAT_MESSAGE",
        chatId: chatId,
        senderId: userId,
        createdAt: new Date().toISOString(),
      });
    }
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
