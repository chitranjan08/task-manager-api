import React from "react";
import { Box, Dialog, Menu, MenuItem } from "./ChatImports";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import MessageArea from "./MessageArea";
import MessageInput from "./MessageInput";
import CreateChatDialog from "./CreateChatDialog";
import { useChat } from "../hooks/useChat";

const Chat = ({ open, onClose, user }) => {
  const {
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
  } = useChat(open, user);

  const handleMenuClick = (e) => {
    setChatMenuAnchor(e.currentTarget);
    setSelectedChatForMenu(selectedChat);
  };

  const handleCloseCreateChat = () => {
    setCreateChatDialog(false);
    setUserSearchQuery("");
    setSelectedUsers([]);
    setGroupName("");
    setChatType("direct");
    setError("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" PaperProps={{ sx: { minHeight: 600 } }}>
      <Box sx={{ display: "flex", height: 600 }}>
        {/* Sidebar */}
        <ChatSidebar
          chats={chats}
          selectedChat={selectedChat}
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onChatSelect={handleChatSelect}
          onCreateChat={() => setCreateChatDialog(true)}
          user={user}
          onlineUsers={onlineUsers}
          getChatDisplayName={getChatDisplayName}
          getChatAvatar={getChatAvatar}
        />

        {/* Main Chat Area */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Chat Header */}
          <ChatHeader
            selectedChat={selectedChat}
            user={user}
            onlineUsers={onlineUsers}
            typingUsers={typingUsers}
            onMenuClick={handleMenuClick}
            getChatDisplayName={getChatDisplayName}
            getChatAvatar={getChatAvatar}
            getTypingStatus={getTypingStatus}
          />

          {/* Messages */}
          <MessageArea
            selectedChat={selectedChat}
            messages={messages}
            user={user}
            typingUsers={typingUsers}
            getTypingStatus={getTypingStatus}
            renderMessageStatus={renderMessageStatus}
            messagesEndRef={messagesEndRef}
          />

          {/* Message Input */}
          <MessageInput
            newMessage={newMessage}
            onMessageChange={setNewMessage}
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            selectedUrl={selectedUrl}
            setSelectedUrl={setSelectedUrl}
            previewUrl={previewUrl}
            setPreviewUrl={setPreviewUrl}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
            selectedChat={selectedChat}
          />
        </Box>
      </Box>

      {/* Create Chat Dialog */}
      <CreateChatDialog
        open={createChatDialog}
        onClose={handleCloseCreateChat}
        chatType={chatType}
        setChatType={setChatType}
        selectedUsers={selectedUsers}
        groupName={groupName}
        setGroupName={setGroupName}
        userSearchQuery={userSearchQuery}
        setUserSearchQuery={setUserSearchQuery}
        userSearchLoading={userSearchLoading}
        filteredUsers={filteredUsers}
        error={error}
        onUserToggle={handleUserToggle}
        onCreateChat={handleCreateChat}
      />

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
