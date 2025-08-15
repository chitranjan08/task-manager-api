  // server/server.js
  const express = require('express');
  const http = require('http');
  const socketIo = require('socket.io');
  const messageService = require('../services/messageService');
  const chatService = require('../service/chatService'); // <-- Add this line
  const User = require('../models/User');
  const app = express();
  const server = http.createServer(app);

  // Create Socket.IO instance
  const io = socketIo(server, {
    cors: {
      origin: 'http://localhost:3001', // frontend origin
      credentials: true,
    },
  });

  // Track multiple sockets per user
  let onlineUsers = new Map(); // userId -> Set(socketIds)

  // Register socket events
  io.on('connection', (socket) => {
    console.log(`📡 New socket connected: ${socket.id}`);

    // Register user socket
    socket.on('register', (userId) => {
      if (!userId) return;

      // Add socket.id to the user's set
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);
      console.log(`✅ User ${userId} registered socket ${socket.id}`);

      // Emit to all clients that this user is online
      io.emit('userOnline', userId);

      // Emit the updated online users list
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });

    // Typing event
  // Assuming onlineUsers is a Map: key = userId (string), value = array of socket IDs
// Example: onlineUsers.set('userId', [socket.id, ...]);

socket.on('typing', async ({ chatId, senderId, senderName, isTyping }) => {
  try {
    // Convert senderId to string
    const senderStr = senderId.toString();

    // Fetch chat members
    const members = await chatService.getChatMembers(chatId);
    console.log("Chat members retrieved:", members);

    // Convert all member IDs to strings for consistent comparison
    const memberIds = members.map((m) => m.toString());

    // Filter out the sender
    const recipients = memberIds.filter((m) => m !== senderStr);

    console.log(`💬 Typing event in chat ${chatId} by user ${senderStr}: ${isTyping}`);
    // console.log("Recipients to notify:", recipients);

    recipients.forEach((memberId) => {
      const sockets = onlineUsers.get(memberId);
      // console.log(`Sockets for user ${memberId}:`, sockets);
      if (!sockets || sockets.length === 0) {
        return;
      }

      console.log(`Broadcasting typing event to ${sockets.length} sockets of user ${memberId}`);

      sockets.forEach((sockId) => {
        console.log(`📨 Emitting to socket: ${sockId}`);
        io.to(sockId).emit(
          isTyping ? 'typing:start' : 'typing:stop',
          { chatId, userId: senderStr, userName: senderName }
        );
      });
    });
  } catch (err) {
    console.error("Error handling typing event:", err);
  }
});


    // Message delivered
    socket.on('message:delivered', async ({ messageId, userId }) => {
      await messageService.markDelivered(messageId, userId);
      const message = await messageService.getMessageById(messageId);
      const sockets = onlineUsers.get(message.senderId.toString());
      if (sockets) {
        sockets.forEach((sockId) => {
          io.to(sockId).emit('messageStatus', { messageId, status: 'delivered', userId });
        });
      }
    });

    // Message read
    socket.on('message:read', async ({ messageId, userId }) => {
      await messageService.markRead(messageId, userId);
      const message = await messageService.getMessageById(messageId);
      const sockets = onlineUsers.get(message.senderId.toString());
      if (sockets) {
        sockets.forEach((sockId) => {
          io.to(sockId).emit('messageStatus', { messageId, status: 'read', userId });
        });
      }
    });

    // Disconnect event
      // Disconnect event
socket.on('disconnect', async () => {
  console.log(`❌ Socket disconnected: ${socket.id}`);

  for (let [userId, socketSet] of onlineUsers) {
    if (socketSet.has(socket.id)) {
      socketSet.delete(socket.id);
      console.log(`🧹 Removed socket ${socket.id} from user ${userId}`);

      // If no more sockets for this user, they are offline
      if (socketSet.size === 0) {
        onlineUsers.delete(userId);
        console.log(`👤 User ${userId} is now offline`);

        try {
          const lastSeen = new Date();
          await User.findByIdAndUpdate(userId, { lastSeen });
          console.log(`🕒 Updated lastSeen for user ${userId}`);

          // Emit to all clients that this user is offline with timestamp
          io.emit('userOffline', { userId, lastSeen });

        } catch (err) {
          console.error(`❌ Error updating lastSeen for user ${userId}:`, err);
        }

        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      }
      break;
    }
  }
});

});

  app.set("io", io);
  app.set("onlineUsers", onlineUsers);

  module.exports = { app, server, io, onlineUsers };
