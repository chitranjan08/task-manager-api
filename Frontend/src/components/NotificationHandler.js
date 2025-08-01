// src/components/NotificationHandler.js
import React, { useEffect, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import axios from "../axios";
import socket, { connectSocket, disconnectSocket } from "../socket";

function NotificationHandler() {
  const [snack, setSnack] = useState({ open: false, message: "" });

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return null;

      const res = await axios.get("/users/profile");
      return res.data?.data;
    } catch (error) {
      console.error("❌ Failed to fetch user:", error);
      return null;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const user = await fetchCurrentUser();
      if (user?._id) {
        connectSocket(user._id);
      }
    };

    initialize();

    // Socket listener for notifications
    socket.on("notification", (data) => {
      console.log("🔔 Notification received:", data);
      setSnack({ open: true, message: data.message });
    });

    return () => {
      disconnectSocket();
      socket.off("notification");
      socket.off("connect");
    };
  }, []);

  return (
    <Snackbar
      open={snack.open}
      autoHideDuration={5000}
      onClose={() => setSnack({ ...snack, open: false })}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert severity="info">{snack.message}</Alert>
    </Snackbar>
  );
}

export default NotificationHandler;
