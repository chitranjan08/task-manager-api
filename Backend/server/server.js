// server/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

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

  socket.on('register', (userId) => {
    if (!userId) return;

    // Add socket.id to the user's set
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    console.log(`✅ User ${userId} registered socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);

    for (let [userId, socketSet] of onlineUsers) {
      if (socketSet.has(socket.id)) {
        socketSet.delete(socket.id);
        console.log(`🧹 Removed socket ${socket.id} from user ${userId}`);

        if (socketSet.size === 0) {
          onlineUsers.delete(userId);
          console.log(`👤 User ${userId} is now offline`);
        }
        break;
      }
    }
  });
});

app.set("io", io);
app.set("onlineUsers", onlineUsers);

module.exports = { app, server, io, onlineUsers };
