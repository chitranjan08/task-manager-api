const Chat = require('../models/Chat');

async function findDirectChat(userId, memberId) {
  return await Chat.findOne({
    type: 'direct',
    members: { $all: [userId, memberId], $size: 2 }
  });
}

async function createDirectChat(userId, memberId) {
  return await Chat.create({
    type: 'direct',
    members: [userId, memberId],
    createdBy: userId,
    admins: [userId, memberId]
  });
}

async function createGroupChat(userId, groupName, members) {
  return await Chat.create({
    type: 'group',
    groupName,
    members: Array.from(new Set([userId, ...members])),
    createdBy: userId,
    admins: [userId]
  });
}

module.exports = {
  findDirectChat,
  createDirectChat,
  createGroupChat
};
