import { Avatar } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import socket from "../socket";

export const handleChatSelect = (chat, setSelectedChat, fetchMessages) => {
  console.log("Selected chat:", chat);
  setSelectedChat(chat);
  fetchMessages(chat._id);
};

export const handleTyping = (e, selectedChat, user, setNewMessage, typingTimeoutRef) => {
  const isTyping = e.target.value.length > 0;
  setNewMessage(e.target.value);

  console.log(`Typing event: isTyping = ${isTyping}, current value = "${e.target.value}"`);

  if (isTyping && !typingTimeoutRef.current) {
    console.log("Emitting typing:start event.");
    socket.emit("typing", {
      chatId: selectedChat._id,
      senderId: user._id,
      senderName: user.name,
      isTyping: true,
    });
  }

  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
    console.log("Typing timeout cleared.");
  }

  typingTimeoutRef.current = setTimeout(() => {
    console.log("Typing timeout elapsed (3s). Emitting typing:stop.");
    socket.emit("typing", {
      chatId: selectedChat._id,
      senderId: user._id,
      senderName: user.name,
      isTyping: false,
    });
    typingTimeoutRef.current = null;
  }, 3000);
};

export const handleUserToggle = (userId, setSelectedUsers) => {
  setSelectedUsers((prev) =>
    prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
  );
  console.log("Toggled user:", userId);
};

export const getChatDisplayName = (chat, user) => {
  console.log("Getting display name for chat:", chat);
  if (chat.type === "group") return chat.groupName;
  if (!user || !chat.members || chat.members.length < 2) return "Direct Message";
  const otherMember = chat.members.find((member) => member._id !== user._id);
  return otherMember?.name || "Unknown";
};

export const getChatAvatar = (chat, user) => {
  if (chat.type === "group") return <Avatar><GroupIcon /></Avatar>;
  if (!user || !chat.members || chat.members.length < 2) return <Avatar>DM</Avatar>;
  const otherMember = chat.members.find((member) => member._id !== user._id);
  console.log("Other member for avatar:", otherMember);
  return otherMember?.avatar ? <Avatar src={otherMember.avatar} /> :
    <Avatar>{otherMember?.name?.charAt(0)?.toUpperCase() || "U"}</Avatar>;
};

export const getTypingStatus = (selectedChat, typingUsers) => {
  if (!selectedChat) return "";
  const typingUsersInChat = typingUsers[selectedChat._id] || [];
  console.log("Current typing users for selected chat:", typingUsersInChat);
  if (typingUsersInChat.length === 0) return "";
  if (typingUsersInChat.length === 1) return `${typingUsersInChat[0]} is typing...`;
  return `${typingUsersInChat.join(", ")} are typing...`;
};
