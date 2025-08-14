const chatService = require('../service/chatService');
const auditLogService = require('../services/auditLogService'); // your existing logging system

exports.createDirectChat = async (req, res) => {
  try {
    const { memberId } = req.body;
    const userId = req.user.id;

    let chat = await chatService.findDirectChat(userId, memberId);

    if (!chat) {
      chat = await chatService.createDirectChat(userId, memberId);
      await auditLogService.logChatCreated(chat);

      // Notify both members
      const io = req.app.get('io');
      const onlineUsers = req.app.get('onlineUsers');
      [userId, memberId].forEach(uid => {
        const sockets = onlineUsers.get(uid);
        if (sockets) {
          sockets.forEach(sockId => {
            io.to(sockId).emit('chat:created', chat);
          });
        }
      });
    }

    res.json(chat);
  } catch (err) {
    console.error('Error creating direct chat', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createGroupChat = async (req, res) => {
  try {
    const { groupName, members } = req.body;
    const userId = req.user.id;

    const chat = await chatService.createGroupChat(userId, groupName, members);
    await auditLogService.logChatCreated(chat);

    // Notify all group members
    const io = req.app.get('io');
    const onlineUsers = req.app.get('onlineUsers');
    chat.members.forEach(uid => {
      const sockets = onlineUsers.get(uid.toString());
      if (sockets) {
        sockets.forEach(sockId => {
          io.to(sockId).emit('chat:created', chat);
        });
      }
    });

    res.json(chat);
  } catch (err) {
    console.error('Error creating group chat', err);
    res.status(500).json({ error: 'Server error' });
  }
};
