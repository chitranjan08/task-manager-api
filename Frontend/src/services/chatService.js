import axios from "../axios";
import socket from "../socket";

export const fetchChats = async (setLoading, setChats, setError) => {
  try {
    setLoading(true);
    console.log("Fetching chats from API...");
    const res = await axios.get("/chat");
    setChats(res.data || []);
    console.log("Chats fetched successfully:", res.data);
  } catch (err) {
    setError("Failed to load chats");
    console.error("Fetch chats error:", err);
  } finally {
    setLoading(false);
  }
};

export const fetchUsers = async (setUserSearchLoading, setUsers, setError, query = "") => {
  try {
    setUserSearchLoading(true);
    console.log("Fetching users from API...");
    const res = query
      ? await axios.get("/users/search", { params: { q: query } })
      : await axios.get("/users/chat-users");

    setUsers(res.data.users || res.data || []);
    console.log("Users fetched successfully:", res.data);
  } catch (err) {
    setError("Failed to load users");
    console.error("Fetch users error:", err);
  } finally {
    setUserSearchLoading(false);
  }
};

export const fetchMessages = async (chatId, setMessages, setError) => {
  try {
    console.log(`Fetching messages for chat ID: ${chatId}`);
    const res = await axios.get(`/chat/${chatId}/messages`);
    setMessages(res.data || []);
    console.log("Messages fetched successfully:", res.data);
  } catch (err) {
    setError("Failed to load messages");
    console.error("Fetch messages error:", err);
  }
};

export const handleSendMessage = async (newMessage, selectedChat, user, setNewMessage, setError) => {
  if (!newMessage.trim() || !selectedChat) {
    console.log("Message is empty or no chat is selected. Aborting send.");
    return;
  }
  const messageContent = newMessage;
  setNewMessage("");

  console.log("User sent a message, emitting typing:stop.");
  socket.emit("typing:stop", { 
    chatId: selectedChat._id, 
    senderId: user._id, 
    senderName: user.name 
  });

  try {
    console.log(`Sending message to chat ${selectedChat._id}: "${messageContent}"`);
    await axios.post(`/chat/${selectedChat._id}/messages`, {
      content: messageContent,
    });
    console.log("Message sent successfully via API.");
  } catch (err) {
    setError("Failed to send message");
    console.error("Send message error:", err);
  }
};

export const handleCreateChat = async (
  chatType,
  selectedUsers,
  groupName,
  setError,
  setChats,
  handleChatSelect,
  setCreateChatDialog,
  setSelectedUsers,
  setGroupName,
  setChatType,
  setUserSearchQuery
) => {
  if (chatType === "group" && (!groupName || selectedUsers.length < 2)) {
    setError("Group chat requires a name and at least two members.");
    return;
  }
  if (chatType === "direct" && selectedUsers.length !== 1) {
    setError("Direct message requires exactly one user.");
    return;
  }
  try {
    console.log(`Creating a new ${chatType} chat...`);
    const chatData =
      chatType === "direct"
        ? { memberId: selectedUsers[0] }
        : { groupName, members: selectedUsers };

    const res = await axios.post(`/chat/${chatType}`, chatData);
    const newChat = res.data;
    console.log("Chat created successfully:", newChat);

    setChats((prevChats) => {
      if (!prevChats.some((chat) => chat._id === newChat._id)) {
        return [newChat, ...prevChats];
      }
      return prevChats;
    });

    handleChatSelect(newChat);
    setCreateChatDialog(false);
    setSelectedUsers([]);
    setGroupName("");
    setChatType("direct");
    setUserSearchQuery("");
    setError("");
  } catch (err) {
    setError("Failed to create chat");
    console.error("Create chat error:", err);
  }
};
