import React from "react";
import { 
  Paper, 
  Typography, 
  Box, 
  Avatar, 
  Tooltip,
  Chip,
  IconButton
} from "@mui/material";
import {
  Flag as FlagIcon,
  Comment as CommentIcon,
  AttachFile as AttachmentIcon,
  Link as LinkIcon
} from "@mui/icons-material";

const TaskCard = ({ task, onUpdate, onClick }) => {
  // Handle API data structure: assignedTo is a string (user name)
  const assignee = task.assignedTo || task.email || "U";
  const initials = assignee.split(" ").map((n) => n[0]).join("").toUpperCase();
  
  // Generate random colors for demo purposes
  const getRandomColor = (name) => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#ff9800';
    }
  };

  // Generate task ID like "Task-101" from the image
  const generateTaskId = (id) => {
    if (task.taskId) return task.taskId;
    const num = id ? parseInt(id.slice(-3), 16) % 999 + 100 : Math.floor(Math.random() * 999) + 100;
    return `Task-${num}`;
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(task);
    }
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        mb: 1,
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        backgroundColor: 'white',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
          borderColor: '#2196f3'
        }
      }}
      onClick={handleCardClick}
    >
      {/* Task Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 600, 
            color: '#333',
            fontSize: '0.9rem'
          }}
        >
          {task.title || `TASK ${task._id?.slice(-2) || Math.floor(Math.random() * 99) + 1}`}
        </Typography>
        <IconButton size="small" sx={{ p: 0, color: getPriorityColor(task.priority) }}>
          <FlagIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Task ID */}
      <Typography 
        variant="caption" 
        sx={{ 
          color: '#666', 
          fontSize: '0.75rem',
          display: 'block',
          mb: 1
        }}
      >
        {generateTaskId(task._id)}
      </Typography>

      {/* Assignee and Due Date */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Tooltip title={assignee}>
          <Avatar 
            sx={{ 
              width: 28, 
              height: 28, 
              fontSize: '0.7rem',
              backgroundColor: getRandomColor(assignee),
              fontWeight: 600
            }}
          >
            {initials}
          </Avatar>
        </Tooltip>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#d32f2f', 
            fontSize: '0.7rem',
            fontWeight: 500
          }}
        >
          {formatDate(task.dueDate)}
        </Typography>
      </Box>

      {/* Task Icons */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <Chip
          icon={<CommentIcon sx={{ fontSize: 12 }} />}
          label="1"
          size="small"
          sx={{ 
            height: 20, 
            fontSize: '0.65rem',
            backgroundColor: '#e3f2fd',
            color: '#1976d2'
          }}
        />
        <Chip
          icon={<AttachmentIcon sx={{ fontSize: 12 }} />}
          label={Math.floor(Math.random() * 5) + 1}
          size="small"
          sx={{ 
            height: 20, 
            fontSize: '0.65rem',
            backgroundColor: '#e8f5e8',
            color: '#2e7d32'
          }}
        />
        <Chip
          icon={<LinkIcon sx={{ fontSize: 12 }} />}
          label={Math.floor(Math.random() * 3) + 1}
          size="small"
          sx={{ 
            height: 20, 
            fontSize: '0.65rem',
            backgroundColor: '#fff3e0',
            color: '#f57c00'
          }}
        />
      </Box>

      {/* Progress Bar */}
      <Box sx={{ 
        height: 4, 
        backgroundColor: '#e0e0e0', 
        borderRadius: 2,
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          height: '100%', 
          width: task.status === 'completed' ? '100%' : task.status === 'in-progress' ? '60%' : '20%',
          background: 'linear-gradient(90deg, #4caf50 0%, #8bc34a 25%, #ffeb3b 50%, #ff9800 75%, #f44336 100%)',
          borderRadius: 2
        }} />
      </Box>
    </Paper>
  );
};

export default TaskCard;