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
    if (open && user) fetchChatsLocal();
  }, [open, user]);

  // --- FETCH USERS FOR CHAT CREATION ---
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

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    // Normalize helper for sender id
    const getSenderId = (msg) => (typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId);

    const handleReceiveMessage = (message) => {
      // only append if the message belongs to currently selected chat
      if (selectedChat && message.chatId === selectedChat._id) {
        console.log("Received message for selected chat:", message);

        // Avoid duplicate messages (by _id) if already present
        setMessages(prev => {
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });

        // Automatically mark delivered if recipient is this user and not the sender
        const senderId = getSenderId(message);
        const alreadyDelivered = Array.isArray(message.deliveredTo)
          ? message.deliveredTo.some(d => String(d.userId) === String(user._id))
          : false;

        if (senderId !== user._id && !alreadyDelivered) {
          socket.emit('message:delivered', { messageId: message._id, userId: user._id });
        }
      } else {
        // if message is for another chat, optionally update chat preview/latestMessage
        // update chats list - ensure chat exists or update its latestMessage
        setChats(prev => {
          const idx = prev.findIndex(c => c._id === message.chatId);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], latestMessage: message };
            return updated;
          }
          return prev;
        });
      }

      // refresh chat list top-level (keeps last message times consistent)
      fetchChatsLocal();
    };

    const handleChatCreated = (chat) => {
      setChats((prev) => (!prev.some((c) => c._id === chat._id) ? [chat, ...prev] : prev));
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
    const handleUserOnline = (userId) => setOnlineUsers(prev => Array.from(new Set([...(prev||[]), userId])));
    const handleUserOffline = ({ userId, lastSeen }) => {
      setOnlineUsers(prev => (prev || []).filter(id => id !== userId));
      setSelectedChat(prev => prev ? { ...prev, members: prev.members.map(m => m._id === userId ? { ...m, lastSeen } : m) } : prev);
    };

    // --- MESSAGE STATUS (SINGLE/DOUBLE/BLUE TICK) ---
    // Server emits: { messageId, status: 'delivered'|'read', userId }
   const handleMessageStatus = ({ messageId, status, userId }) => {
     setMessages(prev =>
       prev.map(msg => {
         if (msg._id !== messageId) return msg;

         const deliveredTo = Array.isArray(msg.deliveredTo) ? [...msg.deliveredTo] : [];
         const readBy = Array.isArray(msg.readBy) ? [...msg.readBy] : [];

         if (status === 'delivered') {
           if (!deliveredTo.some(d => String(d.userId) === String(userId))) {
             deliveredTo.push({ userId, at: new Date().toISOString() });
           }
         } else if (status === 'read') {
           if (!readBy.some(r => String(r.userId) === String(userId))) {
             readBy.push({ userId, at: new Date().toISOString() });
           }
         }

         return { ...msg, deliveredTo, readBy };
       })
     );
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
  }, [selectedChat, user._id]);

  // --- SCROLL TO BOTTOM WHEN MESSAGES CHANGE ---
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  // --- LOCAL FETCH WRAPPERS (so we can update state here) ---
  const fetchChatsLocal = async () => {
    try { setLoading(true); const res = await axios.get("/chat"); setChats(res.data || []); }
    catch (err) { setError("Failed to load chats"); console.error(err); }
    finally { setLoading(false); }
  };

  const fetchUsersLocal = async (query = "") => {
    try {
      setUserSearchLoading(true);
      const res = query
        ? await axios.get("/users/search", { params: { q: query } })
        : await axios.get("/users/chat-users");
      setUsers(res.data.users || res.data || []);
    } catch (err) { setError("Failed to load users"); console.error(err); }
    finally { setUserSearchLoading(false); }
  };

  // --- FETCH MESSAGES ---
  const fetchMessagesLocal = async (chatId) => {
    try {
      const res = await axios.get(`/chat/${chatId}/messages`);
      const msgs = res.data || [];

      // Mark messages as delivered (only if not sender and not already delivered)
      msgs.forEach(m => {
        const senderId = typeof m.senderId === "object" ? m.senderId._id : m.senderId;
        const alreadyDelivered = Array.isArray(m.deliveredTo)
          ? m.deliveredTo.some(d => String(d.userId) === String(user._id))
          : false;

        if (senderId !== user._id && !alreadyDelivered) {
          socket.emit('message:delivered', { messageId: m._id, userId: user._id });
        }
      });

      setMessages(msgs);
    } catch (err) { setError("Failed to load messages"); console.error(err); }
  };

  const handleChatSelect = (chat) => { setSelectedChat(chat); fetchMessagesLocal(chat._id); };

  // --- SEND MESSAGE ---
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    const messageContent = newMessage;
    setNewMessage("");
    socket.emit("typing:stop", { chatId: selectedChat._id, senderId: user._id, senderName: user.name });
    try {
      // send to server; server should broadcast back via receiveMessage
      await axios.post(`/chat/${selectedChat._id}/messages`, { content: messageContent });
    } catch (err) { setError("Failed to send message"); console.error(err); }
  };

  // --- TYPING HANDLER ---
  const handleTypingLocal = (e) => {
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

  // --- RENDER MESSAGE BUBBLE WITH TICKS ---
  const renderMessageStatus = (msg) => {
    console.log("Rendering message status for:", msg);
    // Only show for own messages
    const msgSenderId = typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
    if (String(msgSenderId) !== String(user._id)) return null;

    const delivered = Array.isArray(msg.deliveredTo) && msg.deliveredTo.length > 0;
    const read = Array.isArray(msg.readBy) && msg.readBy.length > 0;

    if (read) {
      return <span style={{ color: "blue" }}>✓✓</span>; // read
    }
    if (delivered) {
      return "✓✓"; // delivered
    }
    return "✓"; // sent (default until delivered comes in)
  };


  const handleCreateChatLocal = async () => {
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

  const handleUserToggleLocal = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
    console.log("Toggled user:", userId);
  };

  const getChatDisplayNameLocal = (chat) => {
    console.log("Getting display name for chat:", chat);
    if (chat.type === "group") return chat.groupName;
    if (!user || !chat.members || chat.members.length < 2) return "Direct Message";
    const otherMember = chat.members.find((member) => member._id !== user._id);
    return otherMember?.name || "Unknown";
  };

  const getChatAvatarLocal = (chat) => {
    if (chat.type === "group") return <Avatar><GroupIcon /></Avatar>;
    if (!user || !chat.members || chat.members.length < 2) return <Avatar>DM</Avatar>;
    const otherMember = chat.members.find((member) => member._id !== user._id);
    console.log("Other member for avatar:", otherMember);
    return otherMember?.avatar ? <Avatar src={otherMember.avatar} /> :
      <Avatar>{otherMember?.name?.charAt(0)?.toUpperCase() || "U"}</Avatar>;
  };

  const filteredChats = chats.filter((chat) =>
    getChatDisplayNameLocal(chat).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter((userItem) => userItem._id !== user._id);

  // --- TYPING STATUS DISPLAY ---
  const getTypingStatusLocal = () => {
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
                      {getChatAvatarLocal(chatItem)}
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
                        {getChatDisplayNameLocal(chatItem)}
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
    {selectedChat && getChatAvatarLocal(selectedChat)}
   <Box>
  {/* Name */}
  <Typography variant="h6" fontWeight="bold">
    {selectedChat ? getChatDisplayNameLocal(selectedChat) : "Select a chat"}
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

  {/* Typing indicator (header) */}
  {getTypingStatusLocal() && (
    <Typography variant="caption" color="primary">
      {getTypingStatusLocal()}
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
  isOwn={isOwn}   // <-- only used in styled(), not forwarded to DOM
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

  {/* --- Message Status (ticks) --- */}
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

            {/* Inline typing bubble at the bottom of the thread */}
            {selectedChat && (typingUsers[selectedChat._id]?.length > 0) && (
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
                  {getTypingStatusLocal()}
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
      onChange={handleTypingLocal}
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
                    onClick={() => handleUserToggleLocal(userItem._id)}
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
            onClick={handleCreateChatLocal}
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
