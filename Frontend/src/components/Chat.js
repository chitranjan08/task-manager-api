import {React,useState,useEffect,useRef,EmojiPicker,axios,socket,InsertEmoticonIcon,ImageIcon,AttachFileIcon,LinkIcon,SendIcon,AddIcon,GroupIcon,PersonIcon,MoreVertIcon,SearchIcon,CloseIcon,ChatIcon,Box,Typography,TextField,Button,List,ListItemAvatar,Avatar,IconButton,Dialog,DialogTitle,DialogContent,DialogActions,Chip,Menu,
  MenuItem,
  ListItemButton,
  ListItemText,
  InputAdornment,
  Alert,
  CircularProgress,
  Paper,
} from "./ChatImports";

import {Sidebar,ChatHeader,MessageArea,MessageBubble,MessageInputArea,formatLastSeen} from "./ChatStyles";
import {
  fetchChats,
  fetchUsers,
  fetchMessages,
  handleSendMessage,
  handleCreateChat
} from "../services/chatService";

import {
  handleChatSelect,
  handleTyping,
  handleUserToggle,
  getChatDisplayName,
  getChatAvatar,
  getTypingStatus
} from "../utils/chatUtils";


const Chat = ({ open, onClose, user }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createChatDialog, setCreateChatDialog] = useState(false);
  const [chatType, setChatType] = useState("direct");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [chatMenuAnchor, setChatMenuAnchor] = useState(null);
  const [selectedChatForMenu, setSelectedChatForMenu] = useState(null);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const messagesEndRef = useRef(null);

  // --- NEW STATES FOR STATUS ---
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeoutRef = useRef();
  // --- END OF NEW STATES ---

  useEffect(() => {
    if (open && user) {
      console.log("Chat component opened. Fetching chats.");
      fetchChats();
    }
  }, [open, user]);

  useEffect(() => {
    let timeoutId;
    if (open && createChatDialog) {
      setUserSearchLoading(true);
      timeoutId = setTimeout(() => {
        if (userSearchQuery.trim()) {
          console.log(`Searching for users with query: ${userSearchQuery}`);
          fetchUsers(userSearchQuery.trim());
        } else {
          console.log("Fetching all chat users.");
          fetchUsers();
        }
      }, 300);
    }
    return () => clearTimeout(timeoutId);
  }, [userSearchQuery, open, createChatDialog]);

  useEffect(() => {
    const handleReceiveMessage = (message) => {
      console.log("Received new message via socket:", message);
      if (selectedChat && message.chatId === selectedChat._id) {
        console.log("Adding new message to current chat.");
        setMessages((prev) => [...prev, message]);
      }
      fetchChats();
    };

    const handleChatCreated = (chat) => {
      console.log("New chat created event received:", chat);
      setChats((prev) => {
        if (!prev.some((existingChat) => existingChat._id === chat._id)) {
          console.log("Adding new chat to the chat list.");
          return [chat, ...prev];
        }
        return prev;
      });

      if (selectedChat && chat._id === selectedChat._id) {
        setSelectedChat(chat);
      }
    };

    // --- CORRECTED SOCKET LISTENERS FOR TYPING AND ONLINE USERS ---
    const handleTypingStart = ({ chatId, userId, userName }) => {
      console.log(`Received typing:start event for chat ${chatId}: ${userName}`);
      // Don't show typing for yourself
      if (userId === user._id) {
        console.log("Ignoring typing event from self.");
        return;
      }

      setTypingUsers((prev) => {
  const currentTypingUsers = new Set(prev[chatId] || []);
  currentTypingUsers.add(userName || userId);
  return {
    ...prev,
    [chatId]: Array.from(currentTypingUsers),
  };
});
    };

    const handleTypingStop = ({ chatId, userId, userName }) => {
      console.log(`Received typing:stop event for chat ${chatId}: ${userName}`);
      setTypingUsers((prev) => {
        const currentTypingUsers = new Set(prev[chatId] || []);
        currentTypingUsers.delete(userName || userId);
        return {
          ...prev,
          [chatId]: Array.from(currentTypingUsers),
        };
      });
    };

    const handleOnlineUsers = (users) => {
      console.log("Online users list received:", users);
      setOnlineUsers(users);
    };

    const handleUserOnline = (userId) => {
      console.log(`User ${userId} came online.`);
      setOnlineUsers(prev => [...new Set([...prev, userId])]);
    };

    const handleUserOffline = ({ userId, lastSeen }) => {
  console.log(`User ${userId} went offline. Last seen: ${lastSeen}`);

  // Remove from online list
  setOnlineUsers(prev => prev.filter(id => id !== userId));

  // Update lastSeen in selectedChat (if applicable)
  setSelectedChat(prev => {
    if (!prev) return prev;
    return {
      ...prev,
      members: prev.members.map(m =>
        m._id === userId ? { ...m, lastSeen } : m
      )
    };
  });
};

    // Listeners
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("chat:created", handleChatCreated);
    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    // Cleanup
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("chat:created", handleChatCreated);
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
      console.log("Socket listeners cleaned up.");
    };
  }, [selectedChat, chats, user._id]);

  useEffect(() => {
    console.log("Messages state updated. Scrolling to bottom.");
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChats = async () => {
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

  const fetchUsers = async (query = "") => {
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

  const fetchMessages = async (chatId) => {
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

  const handleChatSelect = (chat) => {
    console.log("Selected chat:", chat);
    setSelectedChat(chat);
    fetchMessages(chat._id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) {
      console.log("Message is empty or no chat is selected. Aborting send.");
      return;
    }
    const messageContent = newMessage;
    setNewMessage("");
    
    // Emit a 'typing:stop' event before sending the message
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

  // --- HANDLE TYPING EMIT ---
  const handleTyping = (e) => {
    const isTyping = e.target.value.length > 0;
    setNewMessage(e.target.value);
    
    console.log(`Typing event: isTyping = ${isTyping}, current value = "${e.target.value}"`);

    // Only emit 'typing:start' if the user wasn't already typing
    if (isTyping && !typingTimeoutRef.current) {
      console.log("Emitting typing:start event.");
      socket.emit("typing", {
        chatId: selectedChat._id,
        senderId: user._id,
        senderName: user.name,
        isTyping: true,
      });
    }

    // Clear any existing timeout to "debounce" the event
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      console.log("Typing timeout cleared.");
    }

    // Set a new timeout to emit 'typing:stop' after 3 seconds of no typing
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

  const handleUserToggle = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
    console.log("Toggled user:", userId);
  };

  const getChatDisplayName = (chat) => {
    console.log("Getting display name for chat:", chat);
    if (chat.type === "group") return chat.groupName;
    if (!user || !chat.members || chat.members.length < 2) return "Direct Message";
    const otherMember = chat.members.find((member) => member._id !== user._id);
    return otherMember?.name || "Unknown";
  };

  const getChatAvatar = (chat) => {
    if (chat.type === "group") return <Avatar><GroupIcon /></Avatar>;
    if (!user || !chat.members || chat.members.length < 2) return <Avatar>DM</Avatar>;
    const otherMember = chat.members.find((member) => member._id !== user._id);
    console.log("Other member for avatar:", otherMember);
    return otherMember?.avatar ? <Avatar src={otherMember.avatar} /> :
      <Avatar>{otherMember?.name?.charAt(0)?.toUpperCase() || "U"}</Avatar>;
  };

  const filteredChats = chats.filter((chat) =>
    getChatDisplayName(chat).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter((userItem) => userItem._id !== user._id);

  // --- TYPING STATUS DISPLAY ---
  const getTypingStatus = () => {
    if (!selectedChat) return "";
    const typingUsersInChat = typingUsers[selectedChat._id] || [];
    console.log("Current typing users for selected chat:", typingUsersInChat);
    if (typingUsersInChat.length === 0) return "";
    if (typingUsersInChat.length === 1) return `${typingUsersInChat[0]} is typing...`;
    return `${typingUsersInChat.join(", ")} are typing...`;
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" PaperProps={{ sx: { minHeight: 600 } }}>
      <Box sx={{ display: "flex", height: 600 }}>
        {/* Sidebar */}
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
                  onClick={() => handleChatSelect(chatItem)}
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
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {getChatDisplayName(chatItem)}
                        {otherMember && onlineUsers.includes(otherMember._id) && (
                          <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                            ● Online
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      chatItem.latestMessage
                        ? `${chatItem.latestMessage.content} • ${new Date(chatItem.latestMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                        : ""
                    }
                    primaryTypographyProps={{ fontWeight: "bold" }}
                    secondaryTypographyProps={{ color: "text.secondary", noWrap: true }}
                  />
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
              onClick={() => setCreateChatDialog(true)}
            >
              New Chat
            </Button>
          </Box>
        </Sidebar>

        {/* Main Chat Area */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Chat Header */}
          <ChatHeader>
  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    {selectedChat && getChatAvatar(selectedChat)}
   <Box>
  {/* Name */}
  <Typography variant="h6" fontWeight="bold">
    {selectedChat ? getChatDisplayName(selectedChat) : "Select a chat"}
  </Typography>

  {/* Status (online / last seen) */}
  {selectedChat && selectedChat.type === "direct" && (() => {
    const otherMember = selectedChat.members.find((m) => m._id !== user._id);
    console.log("Other member for direct chat:", otherMember);
    if (!otherMember) return null;

    const isOnline = onlineUsers.includes(otherMember._id);

    return (
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
    );
  })()}

  {/* Typing indicator */}
  {getTypingStatus() && (
    <Typography variant="caption" color="primary">
      {getTypingStatus()}
    </Typography>
  )}
</Box>

  </Box>

  <Box>
    <IconButton
      onClick={(e) => {
        setChatMenuAnchor(e.currentTarget);
        setSelectedChatForMenu(selectedChat);
      }}
    >
      <MoreVertIcon />
    </IconButton>
  </Box>
</ChatHeader>


          {/* Messages */}
          <MessageArea>
            {selectedChat ? (
              messages.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                  No messages yet. Start the conversation!
                </Typography>
              ) : (
                [...messages]
                  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                  .map((message) => {
                    const senderId = typeof message.senderId === "object" ? message.senderId._id : message.senderId;
                    const senderName = typeof message.senderId === "object" ? message.senderId.name : "";
                    const senderAvatar = typeof message.senderId === "object" ? message.senderId.avatar : "";
                    const isOwn = user && senderId === user._id;
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
                  })
              )
            ) : (
              <Box sx={{ textAlign: "center", mt: 10 }}>
                <ChatIcon sx={{ fontSize: 64, color: "#b3b3b3", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Select a chat
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a conversation from the list to start messaging
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </MessageArea>

          {/* Message Input */}
         {selectedChat && (
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
      onChange={handleTyping}
      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
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
          handleSendMessage();
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
            setNewMessage((prev) => prev + emojiObject.emoji)
          }
        />
      </div>
    )}
  </MessageInputArea>
)}


        </Box>
      </Box>

      {/* Create Chat Dialog */}
      <Dialog
        open={createChatDialog}
        onClose={() => {
          setCreateChatDialog(false); setUserSearchQuery(""); setSelectedUsers([]); setGroupName(""); setChatType("direct"); setError("");
        }}
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
                    onClick={() => handleUserToggle(userItem._id)}
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
          <Button onClick={() => {
            setCreateChatDialog(false); setUserSearchQuery(""); setSelectedUsers([]); setGroupName(""); setChatType("direct"); setError("");
          }}>Cancel</Button>
          <Button
            onClick={handleCreateChat}
            variant="contained"
            disabled={(chatType === "direct" && selectedUsers.length !== 1) || (chatType === "group" && (!groupName || selectedUsers.length < 2))}
          >
            Create Chat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chat Menu */}
      <Menu
        anchorEl={chatMenuAnchor}
        open={Boolean(chatMenuAnchor)}
        onClose={() => setChatMenuAnchor(null)}
      >
        <MenuItem onClick={() => setChatMenuAnchor(null)}>Archive Chat</MenuItem>
        <MenuItem onClick={() => setChatMenuAnchor(null)}>Delete Chat</MenuItem>
      </Menu>
    </Dialog>
  );
};

export default Chat;