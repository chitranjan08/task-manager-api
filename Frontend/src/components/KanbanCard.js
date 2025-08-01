import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Flag as FlagIcon,
  ChatBubbleOutline as CommentIcon,
  AttachFile as AttachmentIcon,
  CheckBox as SubtaskIcon,
} from "@mui/icons-material";

const KanbanCard = ({ task, onUpdate }) => {
  const assignee = task.assignedTo?.name || "Unassigned";
  const initials = assignee.split(" ").map((n) => n[0]).join("").toUpperCase();
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#44aa44';
      default: return '#888';
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "white",
        borderRadius: 2,
        p: 2,
        border: "1px solid #e0e0e0",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Card Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: "13px",
            color: "#333",
          }}
        >
          {task.taskId || `TASK ${task._id?.slice(-2) || '00'}`}
        </Typography>
        <IconButton size="small" sx={{ p: 0 }}>
          <FlagIcon sx={{ fontSize: 16, color: getPriorityColor(task.priority) }} />
        </IconButton>
      </Box>

      {/* Task Title */}
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          fontSize: "14px",
          color: "#333",
          mb: 2,
          lineHeight: 1.4,
        }}
      >
        {task.title}
      </Typography>

      {/* Assignee and Due Date */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            sx={{
              width: 24,
              height: 24,
              fontSize: "10px",
              backgroundColor: "#1976d2",
            }}
          >
            {initials}
          </Avatar>
          <Typography
            variant="caption"
            sx={{
              fontSize: "11px",
              color: "#666",
            }}
          >
            {task.taskId || `Task-${task._id?.slice(-3) || '000'}`}
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontSize: "11px",
            color: "#ff4444",
            fontWeight: 500,
          }}
        >
          {formatDate(task.dueDate)}
        </Typography>
      </Box>

      {/* Interaction Icons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip
            icon={<CommentIcon sx={{ fontSize: 14 }} />}
            label="1"
            size="small"
            sx={{
              height: 20,
              fontSize: "10px",
              backgroundColor: "#e3f2fd",
              color: "#1976d2",
            }}
          />
          <Chip
            icon={<AttachmentIcon sx={{ fontSize: 14 }} />}
            label={task.attachments?.length || 1}
            size="small"
            sx={{
              height: 20,
              fontSize: "10px",
              backgroundColor: "#e3f2fd",
              color: "#1976d2",
            }}
          />
          <Chip
            icon={<SubtaskIcon sx={{ fontSize: 14 }} />}
            label={task.subtasks?.length || 2}
            size="small"
            sx={{
              height: 20,
              fontSize: "10px",
              backgroundColor: "#e3f2fd",
              color: "#1976d2",
            }}
          />
        </Box>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mt: 1.5 }}>
        <Box
          sx={{
            height: 3,
            backgroundColor: "#e0e0e0",
            borderRadius: 1.5,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${task.progress || 0}%`,
              backgroundColor: "#4caf50",
              transition: "width 0.3s ease",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default KanbanCard; 