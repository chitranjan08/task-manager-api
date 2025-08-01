import React, { useState, useEffect } from "react";
import {
  Box,
  Avatar,
  Badge,
  IconButton,
  Tooltip,
  Divider,
  Menu,
  MenuItem,
  ListItemText,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  GridOn as GridIcon,
  Description as DocumentIcon,
  People as PeopleIcon,
  GetApp as ExportIcon,
  Security as SecurityIcon,
  Notifications as NotificationIcon,
  CheckCircle as CheckCircleIcon,
  DoneAll as DoneAllIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import axios from "../axios";

const Sidebar = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar || "");
  
  const menuItems = [
    { icon: DashboardIcon, label: "Dashboard", active: true },
    { icon: SettingsIcon, label: "Settings" },
    { icon: GridIcon, label: "Projects" },
    { icon: DocumentIcon, label: "Documents" },
    { icon: PeopleIcon, label: "Team" },
    { icon: ExportIcon, label: "Export" },
    { icon: SecurityIcon, label: "Security" },
  ];

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Update profile form when user data changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || "",
      });
      setPreviewUrl(user.avatar || "");
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/notifications");
      console.log("Notifications response:", res.data);
      setNotifications(res.data.data || res.data.notifications || []);
    } catch (err) {
      console.error("❌ Failed to fetch notifications", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (event) => {
    setAnchorEl(event.currentTarget);
    await fetchNotifications();
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      console.log("Marking notification as read:", notificationId);
      const res = await axios.patch(`/notifications/${notificationId}/read`);
      console.log("Mark as read response:", res.data);
      setNotifications((prev) => 
        prev.filter((notification) => notification._id !== notificationId)
      );
    } catch (err) {
      console.error("❌ Failed to mark notification as read", err);
      console.error("Error response:", err.response?.data);
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log("Marking all notifications as read");
      const res = await axios.post("/notifications/read-all");
      console.log("Mark all as read response:", res.data);
      setNotifications([]);
    } catch (err) {
      console.error("❌ Failed to mark all as read", err);
      console.error("Error response:", err.response?.data);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'task':
        return '📋';
      case 'message':
        return '💬';
      case 'alert':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  // Profile functions
  const handleProfileClick = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleEditProfile = () => {
    setProfileDialogOpen(true);
    handleProfileMenuClose();
  };

  const handleProfileDialogClose = () => {
    setProfileDialogOpen(false);
    setProfileError("");
    setSelectedFile(null);
    setPreviewUrl(user?.avatar || "");
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      avatar: user?.avatar || "",
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileFormChange = (e) => {
    setProfileForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleProfileSave = async () => {
    try {
      setProfileLoading(true);
      setProfileError("");

      let res;

      if (selectedFile) {
        // If file is selected, use FormData
        const formData = new FormData();
        formData.append('name', profileForm.name);
        formData.append('email', profileForm.email);
        formData.append('avatar', selectedFile);

        console.log("Sending profile data with file:", formData);

        res = await axios.post('/users/edit-profile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // If no file, use JSON
        const profileData = {
          name: profileForm.name,
          email: profileForm.email,
        };

        console.log("Sending profile data without file:", profileData);

        res = await axios.post('/users/edit-profile', profileData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      console.log("Profile updated successfully:", res.data);
      
      // Update local user state if needed
      if (res.data.user) {
        console.log("Updated user data:", res.data.user);
        // You might want to update the user context/state here
        // For example, if you have a user context:
        // setUser(res.data.user);
      }

      setProfileDialogOpen(false);
      setSelectedFile(null);
      
      // Show success message or update the user prop
     
      
    } catch (err) {
      console.error("❌ Failed to update profile", err);
      console.error("Error response:", err.response?.data);
      setProfileError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Box
      sx={{
        width: 80,
        backgroundColor: "#1a1a1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 2,
        gap: 1,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          width: 40,
          height: 40,
          background: "linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f)",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
          fontSize: "18px",
          fontWeight: "bold",
          color: "white",
        }}
      >
        S
      </Box>

      {/* Menu Items */}
      {menuItems.map((item, index) => (
        <Tooltip key={index} title={item.label} placement="right">
          <IconButton
            sx={{
              color: item.active ? "#ff6b35" : "#888",
              backgroundColor: item.active ? "rgba(255, 107, 53, 0.1)" : "transparent",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <item.icon />
          </IconButton>
        </Tooltip>
      ))}

      <Divider sx={{ width: "80%", my: 2, backgroundColor: "#333" }} />

      {/* Notification Bell */}
      <Tooltip title="Notifications" placement="right">
        <IconButton 
          onClick={handleNotificationClick}
          sx={{ 
            color: notifications.length > 0 ? "#ff6b35" : "#888",
            "&:hover": {
              backgroundColor: "rgba(255, 107, 53, 0.1)",
            },
          }}
        >
          <Badge 
            badgeContent={notifications.length} 
            color="error"
            max={99}
          >
            <NotificationIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Notifications Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleNotificationClose}
        PaperProps={{ 
          style: { 
            width: 380,
            maxHeight: 400,
            marginLeft: 20,
          } 
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              🔔 Notifications
            </Typography>
            {notifications.length > 0 && (
              <Button
                size="small"
                startIcon={<DoneAllIcon />}
                onClick={markAllAsRead}
                sx={{ textTransform: 'none' }}
              >
                Mark all read
              </Button>
            )}
          </Box>
          {notifications.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {notifications.length} unread notification{notifications.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error" sx={{ fontSize: '12px' }}>
              {error}
            </Alert>
          </Box>
        )}

        {/* Notifications List */}
        {!loading && !error && (
          <>
            {notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No notifications yet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  You're all caught up!
                </Typography>
              </Box>
            ) : (
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {notifications.map((notification) => (
                  <MenuItem
                    key={notification._id}
                    sx={{
                      borderBottom: '1px solid #f0f0f0',
                      '&:last-child': { borderBottom: 'none' },
                      '&:hover': {
                        backgroundColor: '#f8f9fa',
                      },
                    }}
                  >
                    <Box sx={{ width: '100%', py: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                          <span style={{ fontSize: '16px' }}>
                            {getNotificationIcon(notification.type)}
                          </span>
                          <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                            {notification.message}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification._id);
                          }}
                          sx={{ 
                            color: '#4caf50',
                            '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
                          }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(notification.createdAt)}
                        </Typography>
                        {notification.type && (
                          <Chip
                            label={notification.type}
                            size="small"
                            sx={{ 
                              fontSize: '10px',
                              height: '20px',
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2'
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Box>
            )}
          </>
        )}
      </Menu>

      {/* User Profile Section */}
      <Box sx={{ mt: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
        <Tooltip title={`${user?.name || 'User'} - Click to edit profile`} placement="right">
          <IconButton
            onClick={handleProfileClick}
            sx={{
              p: 0,
              '&:hover': {
                transform: 'scale(1.05)',
                transition: 'transform 0.2s ease',
              },
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton
                  size="small"
                  sx={{
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    width: 16,
                    height: 16,
                    '&:hover': {
                      backgroundColor: '#e55a2b',
                    },
                  }}
                >
                  <EditIcon sx={{ fontSize: 10 }} />
                </IconButton>
              }
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: user?.avatar ? 'transparent' : '#ff6b35',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: '2px solid #333',
                  '&:hover': {
                    border: '2px solid #ff6b35',
                  },
                }}
                src={user?.avatar}
              >
                {getInitials(user?.name)}
              </Avatar>
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        PaperProps={{ 
          style: { 
            width: 250,
            marginLeft: 20,
          } 
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.name || 'User'}
          </Typography>
        </Box>
        
        <MenuItem onClick={handleEditProfile}>
          <ListItemText 
            primary="Edit Profile" 
            secondary="Update your information"
          />
        </MenuItem>
        
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemText 
            primary="View Profile" 
            secondary="See your full profile"
          />
        </MenuItem>
      </Menu>

      {/* Profile Edit Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={handleProfileDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h5" fontWeight="bold">
              Edit Profile
            </Typography>
            <IconButton onClick={handleProfileDialogClose}>
              <CancelIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {profileError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {profileError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Avatar Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: previewUrl ? 'transparent' : '#ff6b35',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  border: '3px solid #e0e0e0',
                }}
                src={previewUrl}
              >
                {getInitials(profileForm.name)}
              </Avatar>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCameraIcon />}
                  size="small"
                >
                  Upload Photo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
                
                {previewUrl && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(user?.avatar || "");
                    }}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            </Box>

            {/* Form Fields */}
            <TextField
              label="Full Name"
              name="name"
              value={profileForm.name}
              onChange={handleProfileFormChange}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Email"
              name="email"
              value={profileForm.email}
              onChange={handleProfileFormChange}
              fullWidth
              required
              type="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleProfileDialogClose} disabled={profileLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleProfileSave}
            variant="contained"
            startIcon={profileLoading ? <CircularProgress size={16} /> : <SaveIcon />}
            disabled={profileLoading || !profileForm.name || !profileForm.email}
          >
            {profileLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sidebar;

