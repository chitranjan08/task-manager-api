const Message = require('../models/Message');
const Chat = require('../models/Chat');

async function createMessage(chatId, senderId, content) {
  return await Message.create({
    chatId,
    senderId,
    content,
  });
}

async function getMessages(chatId, before = null, limit = 50) {
  let query = { chatId };

  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  return await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate('senderId', 'name avatar')
    .lean();
}

async function getMessageById(messageId) {
  return await Message.findById(messageId).populate('senderId', 'name').lean();
}

async function markDelivered(messageId, userId) {
  return await Message.findByIdAndUpdate(
    messageId,
    {
      $addToSet: {
        deliveredTo: {
          userId,
          at: new Date(),
        },
      },
    },
    { new: true }
  );
}

async function markRead(messageId, userId) {
  return await Message.findByIdAndUpdate(
    messageId,
    {
      $addToSet: {
        readBy: {
          userId,
          at: new Date(),
        },
      },
    },
    { new: true }
  );
}

module.exports = {
  createMessage,
  getMessages,
  getMessageById,
  markDelivered,
  markRead,
};


