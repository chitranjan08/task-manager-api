import { styled } from "@mui/material/styles";
import { Box, Paper } from "@mui/material";

// Sidebar
export const Sidebar = styled(Box)(({ theme }) => ({
  width: 320,
  background: "#f3f2f1",
  borderRight: "1px solid #e1dfdd",
  display: "flex",
  flexDirection: "column",
  height: "100%",
}));

// Chat Header
export const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: "1px solid #e1dfdd",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

// Message Area
export const MessageArea = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: theme.spacing(3),
  background: "#faf9f8",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

// Message Bubble
export const MessageBubble = styled(Paper)(({ theme, isOwn }) => ({
  maxWidth: "60%",
  alignSelf: isOwn ? "flex-end" : "flex-start",
  background: isOwn ? "#d1e7dd" : "#fff",
  color: "#323130",
  borderRadius: 16,
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  padding: theme.spacing(1.5),
  position: "relative",
}));

// Message Input Area
export const MessageInputArea = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid #e1dfdd",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

// Utility function for last seen formatting
export function formatLastSeen(dateString) {
  if (!dateString) return "N/A";

  const lastSeenDate = new Date(dateString);
  const now = new Date();

  const options = { hour: "numeric", minute: "numeric", hour12: true };
  const timePart = lastSeenDate.toLocaleTimeString([], options);

  if (
    lastSeenDate.getDate() === now.getDate() &&
    lastSeenDate.getMonth() === now.getMonth() &&
    lastSeenDate.getFullYear() === now.getFullYear()
  ) {
    return `last seen today at ${timePart}`;
  }

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (
    lastSeenDate.getDate() === yesterday.getDate() &&
    lastSeenDate.getMonth() === yesterday.getMonth() &&
    lastSeenDate.getFullYear() === yesterday.getFullYear()
  ) {
    return `last seen yesterday at ${timePart}`;
  }

  const datePart = lastSeenDate.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `last seen on ${datePart} at ${timePart}`;
}
