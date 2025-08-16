const chatService = require('../service/chatService');
const auditLogService = require('../services/auditLogService'); // your existing logging system
const produceNotification = require("../kafka/producer");

const Message = require('../models/Message'); // Import your Message model

exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const chats = await chatService.getUserChats(userId);

    // Attach latestMessage to each chat
    const chatsWithLatest = await Promise.all(
      chats.map(async (chat) => {
        const latestMessage = await Message.findOne({ chatId: chat._id })
          .sort({ createdAt: -1 })
          .populate('senderId', 'name avatar')
          .lean();
        return { ...chat, latestMessage: latestMessage || null };
      })
    );

    res.json(chatsWithLatest);
  } catch (err) {
    console.error('Error fetching user chats', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createDirectChat = async (req, res) => {
  try {
    const { memberId } = req.body;
    const userId = req.user.userId;

    let chat = await chatService.findDirectChat(userId, memberId);

    if (!chat) {
      // Create the chat if it doesn't exist
      chat = await chatService.createDirectChat(userId, memberId);
    }

    // ✅ Always populate before using the chat object
    await chat.populate({
      path: 'members',
      select: 'name email' // Add 'avatar' or any other fields you need
    });

    // ✅ Emit to both members (only populated data is sent)
    const io = req.app.get('io');
    const onlineUsers = req.app.get('onlineUsers');

    [userId, memberId].forEach((uid) => {
      const sockets = onlineUsers.get(uid);
      if (sockets) {
        sockets.forEach((sockId) => {
          io.to(sockId).emit('chat:created', chat);
        });
      }
    });

    res.json(chat);
  } catch (err) {
    console.error('Error creating direct chat', err);
    res.status(500).json({ error: 'Server error' });
  }
};



exports.createGroupChat = async (req, res) => {
  try {
    const { groupName, members } = req.body;
    const userId = req.user.userId;

    const chat = await chatService.createGroupChat(userId, groupName, members);
    // await auditLogService.logChatCreated(chat);

    // Notify all group members
    const io = req.app.get('io');
    const onlineUsers = req.app.get('onlineUsers');
    chat.members.forEach((uid) => {
      const sockets = onlineUsers.get(uid.toString());
      if (sockets) {
        sockets.forEach((sockId) => {
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
