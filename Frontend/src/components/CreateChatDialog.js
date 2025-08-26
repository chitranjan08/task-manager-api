import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  TextField,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  Chip,
  InputAdornment,
  Alert,
  CircularProgress,
  IconButton,
} from "./ChatImports";
import {
  PersonIcon,
  GroupIcon,
  SearchIcon,
  CloseIcon,
} from "./ChatImports";

const CreateChatDialog = ({
  open,
  onClose,
  chatType,
  setChatType,
  selectedUsers,
  groupName,
  setGroupName,
  userSearchQuery,
  setUserSearchQuery,
  userSearchLoading,
  filteredUsers,
  error,
  onUserToggle,
  onCreateChat,
}) => {
  const handleClose = () => {
    onClose();
    setUserSearchQuery("");
    setGroupName("");
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          {chatType === "direct" ? "New Direct Message" : "Create Group Chat"}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Button
            variant={chatType === "direct" ? "contained" : "outlined"}
            onClick={() => setChatType("direct")}
            startIcon={<PersonIcon />}
          >
            Direct Message
          </Button>
          <Button
            variant={chatType === "group" ? "contained" : "outlined"}
            onClick={() => setChatType("group")}
            startIcon={<GroupIcon />}
          >
            Group Chat
          </Button>
        </Box>
        
        {chatType === "group" && (
          <TextField
            fullWidth
            label="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            sx={{ mb: 2 }}
          />
        )}
        
        <Typography variant="subtitle2" gutterBottom>
          Select {chatType === "direct" ? "a user" : "users"}:
        </Typography>
        
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
          {chatType === "direct"
            ? "Click on a user to select them for direct messaging"
            : "Click on users to select them for group chat"}
        </Typography>
        
        <TextField
          fullWidth
          size="small"
          placeholder="Search users by name or email... (Press Esc to clear)"
          value={userSearchQuery}
          onChange={(e) => setUserSearchQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") setUserSearchQuery(""); }}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {userSearchLoading ? (
                  <CircularProgress size={20} />
                ) : userSearchQuery && (
                  <IconButton size="small" onClick={() => setUserSearchQuery("")} sx={{ p: 0 }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />
        
        <List sx={{ maxHeight: 200, overflow: "auto" }}>
          {userSearchLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {userSearchQuery ? "No users found" : "No users available"}
              </Typography>
              {userSearchQuery && (
                <Typography variant="caption" color="text.secondary">
                  Try a different search term
                </Typography>
              )}
            </Box>
          ) : (
            <>
              {selectedUsers.length > 0 && (
                <Box sx={{ p: 1, mb: 1 }}>
                  <Typography variant="caption" color="primary" fontWeight="bold">
                    Selected ({selectedUsers.length}):{" "}
                    {selectedUsers.map((id) => {
                      const u = filteredUsers.find((user) => user._id === id);
                      return u?.name;
                    }).join(", ")}
                  </Typography>
                </Box>
              )}
              
              {filteredUsers.map((userItem) => (
                <ListItemButton
                  key={userItem._id}
                  selected={selectedUsers.includes(userItem._id)}
                  onClick={() => onUserToggle(userItem._id)}
                  sx={{
                    "&:hover": {
                      backgroundColor: selectedUsers.includes(userItem._id)
                        ? "rgba(25, 118, 210, 0.12)"
                        : "rgba(0, 0, 0, 0.04)",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "rgba(25, 118, 210, 0.12)",
                      "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.16)" },
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={userItem.avatar}>{userItem.name?.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={selectedUsers.includes(userItem._id) ? "bold" : "normal"}>
                      {userItem.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {userItem.email}
                    </Typography>
                  </Box>
                  {selectedUsers.includes(userItem._id) && (
                    <Chip label="Selected" size="small" color="primary" sx={{ fontWeight: "bold" }} />
                  )}
                </ListItemButton>
              ))}
            </>
          )}
        </List>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={onCreateChat}
          variant="contained"
          disabled={(chatType === "direct" && selectedUsers.length !== 1) || (chatType === "group" && (!groupName || selectedUsers.length < 2))}
        >
          Create Chat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateChatDialog;
