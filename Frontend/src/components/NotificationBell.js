import React, { useState } from "react";
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Typography,
  Box,
  Divider,
  Button,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import axios from "../axios";

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const open = Boolean(anchorEl);

  const handleOpen = async (event) => {
    setAnchorEl(event.currentTarget);
    try {
      const res = await axios.get("/notifications");
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch notifications", err);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`/notifications//read`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("❌ Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(`/notifications/read-all`);
      setNotifications([]); // Clear all from local state
    } catch (err) {
      console.error("❌ Failed to mark all as read", err);
    }
  };

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{ style: { width: 320 } }}
      >
        <Box p={1}>
          <Typography variant="h6">🔔 Notifications</Typography>
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <MenuItem disabled>
            <ListItemText primary="No notifications yet." />
          </MenuItem>
        ) : (
          <>
            {notifications.map((notif) => (
              <MenuItem key={notif._id} onClick={() => handleMarkAsRead(notif._id)}>
                <ListItemText
                  primary={notif.message}
                  secondary={new Date(notif.createdAt).toLocaleString()}
                />
              </MenuItem>
            ))}

            <Divider />
            <Box textAlign="center" py={1}>
              <Button onClick={markAllAsRead} size="small">
                Mark all as read
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
