import React from "react";
import { Box, TextField, IconButton, Menu, MenuItem } from "./ChatImports";
import { MessageInputArea } from "./ChatStyles";
import {
  InsertEmoticonIcon,
  ImageIcon,
  AttachFileIcon,
  LinkIcon,
  SendIcon,
  AddIcon,
} from "./ChatImports";
import { EmojiPicker } from "./ChatImports";

const MessageInput = ({
  newMessage,
  onMessageChange,
  onSendMessage,
  onTyping,
  selectedFile,
  setSelectedFile,
  selectedUrl,
  setSelectedUrl,
  previewUrl,
  setPreviewUrl,
  showEmojiPicker,
  setShowEmojiPicker,
  anchorEl,
  setAnchorEl,
  selectedChat,
}) => {
  if (!selectedChat) return null;

  return (
    <MessageInputArea style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {/* "+" button */}
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: "#6264a7" }}>
        <AddIcon />
      </IconButton>

      {/* "+" menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem>
          <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
            <ImageIcon sx={{ marginRight: 1 }} /> Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setSelectedFile(file);
                  setPreviewUrl(URL.createObjectURL(file)); // create preview
                }
                setAnchorEl(null);
              }}
            />
          </label>
        </MenuItem>

        <MenuItem>
          <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
            <AttachFileIcon sx={{ marginRight: 1 }} /> Document
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              hidden
              onChange={(e) => {
                setSelectedFile(e.target.files[0]);
                setAnchorEl(null);
              }}
            />
          </label>
        </MenuItem>

        <MenuItem
          onClick={() => {
            const url = prompt("Enter a URL:");
            if (url) setSelectedUrl(url);
            setAnchorEl(null);
          }}
        >
          <LinkIcon sx={{ marginRight: 1 }} /> Link
        </MenuItem>
      </Menu>

      {/* Emoji button */}
      <IconButton
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        sx={{ color: "#6264a7" }}
      >
        <InsertEmoticonIcon />
      </IconButton>

      {/* Preview if image is selected */}
      {previewUrl && (
        <div style={{ position: "absolute", bottom: "50px", left: "50px", display: "flex", alignItems: "center" }}>
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              width: 60,
              height: 60,
              borderRadius: 8,
              objectFit: "cover",
              border: "1px solid #ccc",
              marginRight: 5
            }}
          />
          <IconButton
            size="small"
            onClick={() => {
              setSelectedFile(null);
              setPreviewUrl(null);
            }}
            sx={{ color: "red" }}
          >
            ✖
          </IconButton>
        </div>
      )}

      {/* Message input */}
      <TextField
        fullWidth
        size="small"
        placeholder="Type a message..."
        value={newMessage}
        onChange={onTyping}
        onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
        sx={{ borderRadius: 2 }}
      />

      {/* Send button */}
      <IconButton
        onClick={() => {
          if (selectedFile) {
            console.log("Sending file:", selectedFile);
            // Upload logic here...
            setSelectedFile(null);
            setPreviewUrl(null);
          } else {
            onSendMessage();
          }
        }}
        disabled={!newMessage.trim() && !selectedFile && !selectedUrl}
        sx={{
          backgroundColor: "#6264a7",
          color: "white",
          borderRadius: 2,
          "&:hover": { backgroundColor: "#464775" },
          "&:disabled": { backgroundColor: "#ccc" },
        }}
      >
        <SendIcon />
      </IconButton>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div style={{ position: "absolute", bottom: "60px", zIndex: 100 }}>
          <EmojiPicker
            onEmojiClick={(emojiObject) =>
              onMessageChange((prev) => prev + emojiObject.emoji)
            }
          />
        </div>
      )}
    </MessageInputArea>
  );
};

export default MessageInput;
