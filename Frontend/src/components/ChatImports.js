// React
import React, { useState, useEffect, useRef } from "react";

// External Libraries
import EmojiPicker from "emoji-picker-react";
import axios from "../axios";
import socket from "../socket";

// MUI Icons
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import ImageIcon from "@mui/icons-material/Image";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import LinkIcon from "@mui/icons-material/Link";
import {
  Send as SendIcon,
  Add as AddIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";

// MUI Components
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItemAvatar,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Menu,
  MenuItem,
  ListItemButton,
  ListItemText,
  InputAdornment,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";

// Export all together
export {
  React,
  useState,
  useEffect,
  useRef,
  EmojiPicker,
  axios,
  socket,
  InsertEmoticonIcon,
  ImageIcon,
  AttachFileIcon,
  LinkIcon,
  SendIcon,
  AddIcon,
  GroupIcon,
  PersonIcon,
  MoreVertIcon,
  SearchIcon,
  CloseIcon,
  ChatIcon,
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItemAvatar,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Menu,
  MenuItem,
  ListItemButton,
  ListItemText,
  InputAdornment,
  Alert,
  CircularProgress,
  Paper,
};
