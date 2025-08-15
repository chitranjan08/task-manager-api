const AuditLog = require('../models/AuditLog');

async function logChatCreated(chat) {
  
  try {
    await AuditLog.create({
      action: 'CHAT_CREATED',
      userId: chat.createdBy,
      details: {
        chatId: chat._id,
        chatType: chat.type,
        members: chat.members,
      },
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Error logging chat creation:', err);
  }
}

async function logMessageSent(message) {
  try {
    await AuditLog.create({
      action: 'MESSAGE_SENT',
      userId: message.senderId,
      details: {
        messageId: message._id,
        chatId: message.chatId,
        content: message.content.substring(0, 100), // Truncate for privacy
      },
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Error logging message sent:', err);
  }
}

module.exports = {
  logChatCreated,
  logMessageSent,
};

