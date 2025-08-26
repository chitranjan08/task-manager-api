import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItemAvatar,
  Avatar,
  ListItemButton,
  InputAdornment,
} from "./ChatImports";
import { Sidebar } from "./ChatStyles";
import { AddIcon, SearchIcon, GroupIcon } from "./ChatImports";

const ChatSidebar = ({
  chats,
  selectedChat,
  searchQuery,
  onSearchChange,
  onChatSelect,
  onCreateChat,
  user,
  onlineUsers,
  getChatDisplayName,
  getChatAvatar,
}) => {
  const filteredChats = chats.filter((chat) =>
    getChatDisplayName(chat).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sidebar>
      <Box sx={{ p: 2, pb: 0 }}>
        <Typography variant="h6" fontWeight="bold" color="#6264a7">
          Chats
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Search chats"
          value={searchQuery}
          onChange={onSearchChange}
          sx={{ mt: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <List sx={{ flex: 1, overflowY: "auto", mt: 1 }}>
        {filteredChats.map((chatItem) => {
          const otherMember = chatItem.members.find((member) => member._id !== user._id);
          return (
            <ListItemButton
              key={chatItem._id}
              selected={selectedChat?._id === chatItem._id}
              onClick={() => onChatSelect(chatItem)}
              sx={{
                borderRadius: 2,
                mb: 1,
                mx: 1,
                backgroundColor: selectedChat?._id === chatItem._id ? "#e1eafc" : "transparent",
                "&:hover": { backgroundColor: "#e1eafc" },
              }}
            >
              <ListItemAvatar>
                <Box sx={{ position: "relative" }}>
                  {getChatAvatar(chatItem)}
                  {otherMember && onlineUsers.includes(otherMember._id) && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 2,
                        right: 2,
                        width: 10,
                        height: 10,
                        bgcolor: "#44b700",
                        borderRadius: "50%",
                        border: "2px solid white",
                      }}
                    />
                  )}
                </Box>
              </ListItemAvatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {getChatDisplayName(chatItem)}
                  </Typography>
                  {otherMember && onlineUsers.includes(otherMember._id) && (
                    <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                      ● Online
                    </Typography>
                  )}
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", noWrap: true }}
                >
                  {chatItem.latestMessage
                    ? `${chatItem.latestMessage.content} • ${new Date(chatItem.latestMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                    : ""}
                </Typography>
              </Box>
            </ListItemButton>
          );
        })}
      </List>
      
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ background: "#6264a7", color: "#fff", borderRadius: 2 }}
          onClick={onCreateChat}
        >
          New Chat
        </Button>
      </Box>
    </Sidebar>
  );
};

export default ChatSidebar;
