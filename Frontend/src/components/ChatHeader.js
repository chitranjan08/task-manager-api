import React from "react";
import { Box, Typography, IconButton } from "./ChatImports";
import { ChatHeader as StyledChatHeader } from "./ChatStyles";
import { MoreVertIcon } from "./ChatImports";
import { formatLastSeen } from "./ChatStyles";

const ChatHeader = ({
  selectedChat,
  user,
  onlineUsers,
  typingUsers,
  onMenuClick,
  getChatDisplayName,
  getChatAvatar,
  getTypingStatus,
}) => {
  if (!selectedChat) {
    return (
      <StyledChatHeader>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Select a chat
          </Typography>
        </Box>
      </StyledChatHeader>
    );
  }

  const otherMember = selectedChat.members.find((m) => m._id !== user._id);
  const isOnline = otherMember && onlineUsers.includes(otherMember._id);
  const typingStatus = getTypingStatus();

  return (
    <StyledChatHeader>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {getChatAvatar(selectedChat)}
        <Box>
          {/* Name */}
          <Typography variant="h6" fontWeight="bold">
            {getChatDisplayName(selectedChat)}
          </Typography>

          {/* Status (online / last seen) */}
          {selectedChat.type === "direct" && otherMember && (
            <>
              {isOnline ? (
                <Typography variant="caption" color="success.main">
                  Online
                </Typography>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  {formatLastSeen(otherMember.lastSeen)}
                </Typography>
              )}
            </>
          )}

          {/* Typing indicator (header) */}
          {typingStatus && (
            <Typography variant="caption" color="primary">
              {typingStatus}
            </Typography>
          )}
        </Box>
      </Box>

      <Box>
        <IconButton onClick={onMenuClick}>
          <MoreVertIcon />
        </IconButton>
      </Box>
    </StyledChatHeader>
  );
};

export default ChatHeader;
