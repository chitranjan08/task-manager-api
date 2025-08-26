// server/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const messageService = require('../services/messageService');
const chatService = require('../service/chatService');
const User = require('../models/User'); // Assuming you have a User model
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
let userSocketMap = new Map(); // socketId -> userId

// Register socket events
io.on('connection', (socket) => {
  console.log(`📡 New socket connected: ${socket.id}`);

  // Register user socket
  socket.on('register', (userId) => {
    if (!userId) return;

    const userStr = userId.toString();

    // Add socket.id to the user's set
    if (!onlineUsers.has(userStr)) {
      onlineUsers.set(userStr, new Set());
    }
    onlineUsers.get(userStr).add(socket.id);

    // Store a reverse map from socketId to userId
    userSocketMap.set(socket.id, userStr);

    console.log(`✅ User ${userStr} registered socket ${socket.id}`);

    // Emit to all clients that this user is online
    io.emit('userOnline', userStr);

    // Emit the updated online users list
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  // Typing event
  socket.on('typing', async ({ chatId, senderId, senderName, isTyping }) => {
    try {
      const senderStr = senderId.toString();
      const members = await chatService.getChatMembers(chatId);
      const memberIds = members.map((m) => m.toString());
      const recipients = memberIds.filter((m) => m !== senderStr);

      recipients.forEach((memberId) => {
        const sockets = onlineUsers.get(memberId);
        if (sockets && sockets.size > 0) {
          sockets.forEach((sockId) => {
            io.to(sockId).emit(isTyping ? 'typing:start' : 'typing:stop', {
              chatId,
              userId: senderStr,
              userName: senderName,
            });
          });
        }
      });
    } catch (err) {
      console.error('Error handling typing event:', err);
    }
  });

  // Message delivered
  socket.on('message:delivered', async ({ messageId, userId }) => {
    const message = await messageService.getMessageById(messageId);
    const senderId = message.senderId._id.toString(); // get the ObjectId string
    const receiverId = userId.toString();

    if (message && senderId !== receiverId) {
     
      await messageService.markDelivered(messageId, userId);

      // Notify sender sockets
      const senderSockets = onlineUsers.get(senderId);
      if (senderSockets && senderSockets.size > 0) {
        senderSockets.forEach((sockId) => {
          io.to(sockId).emit('messageStatus', { messageId, status: 'delivered', userId });
        });
      }
    }
  });

  // Message read
  socket.on('message:read', async ({ messageId, userId }) => {
    console.log(`Message read by user ${userId} for message ${messageId}`);
    await messageService.markRead(messageId, userId);
    const message = await messageService.getMessageById(messageId);
    const senderSockets = onlineUsers.get(message.senderId._id.toString());
      console.log(senderSockets);

    if (senderSockets && senderSockets.size > 0) {
      console.log(`Notifying sender ${message.senderId} that message ${messageId} was read by ${userId}`);
      senderSockets.forEach((sockId) => {
        io.to(sockId).emit('messageStatus', { messageId, status: 'read', userId });
      });
    }
  });

  // Disconnect event
  socket.on('disconnect', async () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);

    const userId = userSocketMap.get(socket.id);
    if (!userId) return; // Ignore if socket wasn't registered

    const userSockets = onlineUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      console.log(`🧹 Removed socket ${socket.id} from user ${userId}`);

      // If no more sockets for this user, they are offline
      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
        userSocketMap.delete(socket.id);
        console.log(`👤 User ${userId} is now offline`);

        try {
          const lastSeen = new Date();
          await User.findByIdAndUpdate(userId, { lastSeen });
          io.emit('userOffline', { userId, lastSeen });
          console.log(`🕒 Updated lastSeen for user ${userId}`);
        } catch (err) {
          console.error(`❌ Error updating lastSeen for user ${userId}:`, err);
        }

        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      }
    }
  });
});

app.set('io', io);
app.set('onlineUsers', onlineUsers);

module.exports = { app, server, io, onlineUsers };
