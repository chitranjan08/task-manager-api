const Chat = require('../models/Chat');

async function findDirectChat(userId, memberId) {
  return await Chat.findOne({
    type: 'direct',
    members: { $all: [userId, memberId], $size: 2 },
  });
}

async function createDirectChat(userId, memberId) {
  return await Chat.create({
    type: 'direct',
    members: [userId, memberId],
    createdBy: userId,
    admins: [userId, memberId],
  });
}

async function createGroupChat(userId, groupName, members) {
  return await Chat.create({
    type: 'group',
    groupName,
    members: Array.from(new Set([userId, ...members])),
    createdBy: userId,
    admins: [userId],
  });
}

async function getChatMembers(chatId) {
  const chat = await Chat.findById(chatId).populate('members', 'name lastSeen');
  return chat ? chat.members.map((member) => member._id) : [];
}

async function getUserChats(userId) {
  return await Chat.find({
    members: userId,
    isArchived: false,
  })
    .populate('members', 'name lastSeen avatar')
    .populate('createdBy', 'name lastSeen avatar')
    .sort({ updatedAt: -1 })
    .lean();
}

module.exports = {
  findDirectChat,
  createDirectChat,
  createGroupChat,
  getChatMembers,
  getUserChats,
};
