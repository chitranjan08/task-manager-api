import React from "react";
import { Box, Typography, Avatar } from "./ChatImports";
import { MessageArea as StyledMessageArea, MessageBubble } from "./ChatStyles";
import { ChatIcon } from "./ChatImports";

const MessageArea = ({
  selectedChat,
  messages,
  user,
  typingUsers,
  getTypingStatus,
  renderMessageStatus,
  messagesEndRef,
}) => {
  if (!selectedChat) {
    return (
      <StyledMessageArea>
        <Box sx={{ textAlign: "center", mt: 10 }}>
          <ChatIcon sx={{ fontSize: 64, color: "#b3b3b3", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Select a chat
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose a conversation from the list to start messaging
          </Typography>
        </Box>
      </StyledMessageArea>
    );
  }

  if (messages.length === 0) {
    return (
      <StyledMessageArea>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          No messages yet. Start the conversation!
        </Typography>
        <div ref={messagesEndRef} />
      </StyledMessageArea>
    );
  }

  return (
    <StyledMessageArea>
      {[...messages]
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((message) => {
          const senderId = typeof message.senderId === "object" ? message.senderId._id : message.senderId;
          const senderName = typeof message.senderId === "object" ? message.senderId.name : "";
          const senderAvatar = typeof message.senderId === "object" ? message.senderId.avatar : "";
          const isOwn = user && String(senderId) === String(user._id);
          
          return (
            <Box
              key={message._id}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: isOwn ? "flex-end" : "flex-start",
                width: "100%",
              }}
            >
              <MessageBubble
                isOwn={isOwn}
                elevation={0}
                sx={{
                  wordBreak: "break-word",
                  whiteSpace: "pre-line",
                  position: "relative",
                  paddingRight: isOwn ? "24px" : "8px",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Avatar src={senderAvatar} sx={{ width: 24, height: 24 }}>
                    {senderName?.charAt(0)}
                  </Avatar>
                  <Typography variant="caption" fontWeight="bold">
                    {senderName}
                  </Typography>
                </Box>

                <Typography variant="body2">
                  {message.content}
                </Typography>

                {/* Message Status (ticks) */}
                {isOwn && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 2,
                      right: 8,
                      fontSize: 12,
                    }}
                  >
                    {renderMessageStatus(message)}
                  </Box>
                )}
              </MessageBubble>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  mb: 1,
                  textAlign: isOwn ? "right" : "left",
                  fontSize: "0.75rem",
                  maxWidth: "60%",
                  wordBreak: "break-word",
                }}
              >
                {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Typography>
            </Box>
          );
        })}

      {/* Inline typing bubble at the bottom of the thread */}
      {typingUsers[selectedChat._id]?.length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 1,
            borderRadius: 2,
            backgroundColor: "#f1f5ff",
            color: "#6264a7",
            width: "fit-content",
            maxWidth: "70%",
            mt: 1,
          }}
        >
          <Avatar sx={{ width: 20, height: 20 }}>
            {(typingUsers[selectedChat._id][0] || "?")?.charAt(0)}
          </Avatar>
          <Typography variant="caption" sx={{ whiteSpace: "nowrap" }}>
            {getTypingStatus()}
          </Typography>
        </Box>
      )}

      <div ref={messagesEndRef} />
    </StyledMessageArea>
  );
};

export default MessageArea;
