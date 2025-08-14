const Message = require('../models/Message');

async function createMessage(chatId, senderId, text) {
  return await Message.create({
    chatId,
    senderId,
    text,
    deliveredTo: [],
    readBy: []
  });
}

async function getMessages(chatId, before, limit) {
  const query = { chatId };
  if (before) query.createdAt = { $lt: new Date(before) };

  return await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));
}

async function markDelivered(messageId, userId) {
  return await Message.findByIdAndUpdate(
    messageId,
    { $addToSet: { deliveredTo: { userId, at: new Date() } } },
    { new: true }
  );
}

async function markRead(messageId, userId) {
  return await Message.findByIdAndUpdate(
    messageId,
    { $addToSet: { readBy: { userId, at: new Date() } } },
    { new: true }
  );
}

module.exports = {
  createMessage,
  getMessages,
  markDelivered,
  markRead
};
