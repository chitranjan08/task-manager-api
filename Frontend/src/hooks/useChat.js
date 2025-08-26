import { useState, useEffect, useRef, useCallback } from "react";
import { axios, socket, Avatar, GroupIcon } from "../components/ChatImports";

export const useChat = (open, user) => {
  // Chat state
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create chat dialog state
  const [createChatDialog, setCreateChatDialog] = useState(false);
  const [chatType, setChatType] = useState("direct");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  // Chat menu state
  const [chatMenuAnchor, setChatMenuAnchor] = useState(null);
  const [selectedChatForMenu, setSelectedChatForMenu] = useState(null);

  // Message input state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  // Online and typing state
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeoutRef = useRef();

  const messagesEndRef = useRef();

  // Memoize the chat list update function
  const updateChatLatestMessage = useCallback((chatId, updatedMessage) => {
    setChats(prevChats => prevChats.map(chat => {
      if (String(chat._id) === String(chatId)) {
        return { ...chat, latestMessage: updatedMessage };
      }
      return chat;
    }));
  }, []);

  // Fetch chats when component opens
  useEffect(() => {
    if (open && user) fetchChatsLocal();
  }, [open, user]);

  // Fetch users for chat creation
  useEffect(() => {
    let timeoutId;
    if (open && createChatDialog) {
      setUserSearchLoading(true);
      timeoutId = setTimeout(() => {
        if (userSearchQuery.trim()) fetchUsersLocal(userSearchQuery.trim());
        else fetchUsersLocal();
      }, 300);
    }
    return () => clearTimeout(timeoutId);
  }, [userSearchQuery, open, createChatDialog]);

  // Socket listeners
  useEffect(() => {
    if (!user?._id) return;

    const getSenderId = (msg) => (msg.senderId?._id || msg.senderId);

    const handleReceiveMessage = (message) => {
      if (selectedChat && String(message.chatId) === String(selectedChat._id)) {
        setMessages(prev => {
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });

        // Emit delivered and read logic
        const senderId = message.senderId?._id || message.senderId;
        const isNotSender = senderId !== user._id;

        if (isNotSender) {
          socket.emit("message:delivered", { messageId: message._id, userId: user._id });
          socket.emit("message:read", { messageId: message._id, userId: user._id });
        }
      } else {
        setChats(prev => {
          const idx = prev.findIndex(c => String(c._id) === String(message.chatId));
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], latestMessage: message };
            return updated;
          }
          return prev;
        });
      }
    };

    const handleChatCreated = (chat) => {
      setChats(prev => (!prev.some(c => c._id === chat._id) ? [chat, ...prev] : prev));
      if (selectedChat && chat._id === selectedChat._id) setSelectedChat(chat);
    };

    const handleTypingStart = ({ chatId, userId, userName }) => {
      if (userId === user._id) return;
      setTypingUsers(prev => {
        const currentTypingUsers = new Set(prev[chatId] || []);
        currentTypingUsers.add(userName || userId);
        return { ...prev, [chatId]: Array.from(currentTypingUsers) };
      });
    };

    const handleTypingStop = ({ chatId, userId, userName }) => {
      setTypingUsers(prev => {
        const currentTypingUsers = new Set(prev[chatId] || []);
        currentTypingUsers.delete(userName || userId);
        return { ...prev, [chatId]: Array.from(currentTypingUsers) };
      });
    };

    const handleOnlineUsers = (users) => setOnlineUsers(users || []);
    const handleUserOnline = (userId) => setOnlineUsers(prev => Array.from(new Set([...(prev || []), userId])));
    const handleUserOffline = ({ userId, lastSeen }) => {
      setOnlineUsers(prev => (prev || []).filter(id => id !== userId));
      setSelectedChat(prev => prev ? { ...prev, members: prev.members.map(m => m._id === userId ? { ...m, lastSeen } : m) } : prev);
    };

    const handleMessageStatus = ({ messageId, status, userId }) => {
      setMessages(prevMessages => {
        const updatedMessages = prevMessages.map(msg => {
          if (msg._id !== messageId) return msg;
          const newMsg = { ...msg };

          if (status === 'delivered') {
            const deliveredTo = Array.isArray(newMsg.deliveredTo) ? [...newMsg.deliveredTo] : [];
            if (!deliveredTo.some(d => String(d.userId) === String(userId))) {
              deliveredTo.push({ userId, at: new Date().toISOString() });
            }
            newMsg.deliveredTo = deliveredTo;
          }

          if (status === 'read') {
            const readBy = Array.isArray(newMsg.readBy) ? [...newMsg.readBy] : [];
            if (!readBy.some(r => String(r.userId) === String(userId))) {
              readBy.push({ userId, at: new Date().toISOString() });
            }
            newMsg.readBy = readBy;
          }
          return newMsg;
        });

        const updatedMessage = updatedMessages.find(msg => msg._id === messageId);
        if (updatedMessage) {
          // This call is crucial, but it was using stale state.
          // Now it uses the memoized function which accesses the latest state.
          updateChatLatestMessage(updatedMessage.chatId, updatedMessage);
        }

        return updatedMessages;
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("chat:created", handleChatCreated);
    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);
    socket.on("messageStatus", handleMessageStatus);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("chat:created", handleChatCreated);
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
      socket.off("messageStatus", handleMessageStatus);
    };
  }, [selectedChat, user?._id, updateChatLatestMessage]); // Add updateChatLatestMessage as a dependency

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch chats
  const fetchChatsLocal = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/chat");
      setChats(res.data || []);
    } catch (err) {
      setError("Failed to load chats");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users
  const fetchUsersLocal = async (query = "") => {
    try {
      setUserSearchLoading(true);
      const res = query
        ? await axios.get("/users/search", { params: { q: query } })
        : await axios.get("/users/chat-users");
      setUsers(res.data.users || res.data || []);
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setUserSearchLoading(false);
    }
  };

  // Fetch messages
  const fetchMessagesLocal = async (chatId) => {
    try {
      const res = await axios.get(`/chat/${chatId}/messages`);
      const msgs = res.data || [];
      setMessages(msgs);

      msgs.forEach(m => {
        const senderId = m.senderId?._id || m.senderId;
        const isNotSender = senderId !== user._id;

        if (isNotSender) {
          const alreadyDelivered = Array.isArray(m.deliveredTo) && m.deliveredTo.some(d => String(d.userId) === String(user._id));
          const alreadyRead = Array.isArray(m.readBy) && m.readBy.some(r => String(r.userId) === String(user._id));

          if (!alreadyDelivered) {
            socket.emit("message:delivered", { messageId: m._id, userId: user._id });
          }
          if (!alreadyRead) {
            socket.emit("message:read", { messageId: m._id, userId: user._id });
          }
        }
      });
    } catch (err) {
      setError("Failed to load messages");
      console.error(err);
    }
  };

  // Chat selection
  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    fetchMessagesLocal(chat._id);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    const messageContent = newMessage;
    setNewMessage("");
    socket.emit("typing:stop", { chatId: selectedChat._id, senderId: user._id, senderName: user.name });

    try {
      await axios.post(`/chat/${selectedChat._id}/messages`, { content: messageContent });
    } catch (err) {
      setError("Failed to send message");
      console.error(err);
    }
  };

  // Typing
  const handleTyping = (e) => {
    const isTyping = e.target.value.length > 0;
    setNewMessage(e.target.value);
    if (!selectedChat) return;

    if (isTyping && !typingTimeoutRef.current) {
      socket.emit("typing", { chatId: selectedChat._id, senderId: user._id, senderName: user.name, isTyping: true });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { chatId: selectedChat._id, senderId: user._id, senderName: user.name, isTyping: false });
      typingTimeoutRef.current = null;
    }, 3000);
  };

  // Message status rendering
  const renderMessageStatus = (msg) => {
    const msgSenderId = msg.senderId?._id || msg.senderId;
    if (String(msgSenderId) !== String(user._id)) return null;

    const delivered = Array.isArray(msg.deliveredTo) && msg.deliveredTo.length > 0;
    const read = Array.isArray(msg.readBy) && msg.readBy.length > 0;

    if (read) return <span style={{ color: "blue" }}>✓✓</span>;
    if (delivered) return "✓✓";
    return "✓";
  };

  // Create chat
  const handleCreateChat = async () => {
    if (chatType === "group" && (!groupName || selectedUsers.length < 2)) {
      setError("Group chat requires a name and at least two members.");
      return;
    }
    if (chatType === "direct" && selectedUsers.length !== 1) {
      setError("Direct message requires exactly one user.");
      return;
    }

    try {
      const chatData =
        chatType === "direct"
          ? { memberId: selectedUsers[0] }
          : { groupName, members: selectedUsers };

      const res = await axios.post(`/chat/${chatType}`, chatData);
      const newChat = res.data;

      setChats(prev => (!prev.some(c => c._id === newChat._id) ? [newChat, ...prev] : prev));
      handleChatSelect(newChat);

      setCreateChatDialog(false);
      setSelectedUsers([]);
      setGroupName("");
      setChatType("direct");
      setUserSearchQuery("");
      setError("");
    } catch (err) {
      setError("Failed to create chat");
      console.error(err);
    }
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  // Utilities
  const getChatDisplayName = (chat) => {
    if (chat.type === "group") return chat.groupName;
    if (!user || !chat.members || chat.members.length < 2) return "Direct Message";
    const otherMember = chat.members.find(m => m._id !== user._id);
    return otherMember?.name || "Unknown";
  };

  const getChatAvatar = (chat) => {
    if (chat.type === "group") return <Avatar><GroupIcon /></Avatar>;
    if (!user || !chat.members || chat.members.length < 2) return <Avatar>DM</Avatar>;
    const otherMember = chat.members.find(m => m._id !== user._id);
    return otherMember?.avatar ? <Avatar src={otherMember.avatar} /> :
      <Avatar>{otherMember?.name?.charAt(0)?.toUpperCase() || "U"}</Avatar>;
  };

  const getTypingStatus = () => {
    if (!selectedChat) return "";
    const typingUsersInChat = typingUsers[selectedChat._id] || [];
    if (typingUsersInChat.length === 0) return "";
    if (typingUsersInChat.length === 1) return `${typingUsersInChat[0]} is typing...`;
    return `${typingUsersInChat.join(", ")} are typing...`;
  };

  const filteredUsers = users.filter(u => u._id !== user._id);

  return {
    // State
    chats,
    selectedChat,
    messages,
    newMessage,
    users,
    loading,
    error,
    createChatDialog,
    chatType,
    selectedUsers,
    groupName,
    searchQuery,
    userSearchQuery,
    userSearchLoading,
    chatMenuAnchor,
    selectedChatForMenu,
    showEmojiPicker,
    anchorEl,
    selectedFile,
    selectedUrl,
    previewUrl,
    onlineUsers,
    typingUsers,
    messagesEndRef,

    // Setters
    setCreateChatDialog,
    setChatType,
    setGroupName,
    setSearchQuery,
    setUserSearchQuery,
    setSelectedUsers,
    setShowEmojiPicker,
    setAnchorEl,
    setSelectedFile,
    setSelectedUrl,
    setPreviewUrl,
    setChatMenuAnchor,
    setSelectedChatForMenu,
    setError,
    setNewMessage,

    // Functions
    handleChatSelect,
    handleSendMessage,
    handleTyping,
    renderMessageStatus,
    handleCreateChat,
    handleUserToggle,
    getChatDisplayName,
    getChatAvatar,
    getTypingStatus,
    filteredUsers,
  };
};