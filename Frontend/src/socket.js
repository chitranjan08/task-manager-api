// src/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  autoConnect: false,
  withCredentials: true,
});

export const connectSocket = (userId) => {
  if (!socket.connected) {
    socket.connect();
  }

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
    if (userId) {
      socket.emit("register", userId);
      console.log("📡 Registered user:", userId);
    }
  });
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
    console.log("🔌 Socket disconnected");
  }
};

export default socket;
