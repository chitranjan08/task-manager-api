import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import TaskCard from "./TaskCard";

const TaskColumn = ({ title, tasks, color, onTaskUpdate, onTaskClick }) => {
  return (
    <Paper 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e0e0e0',
        borderRadius: 2
      }}
    >
      {/* Column Header */}
      <Box
        sx={{
          p: 2,
          backgroundColor: color,
          color: 'white',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ 
          backgroundColor: 'rgba(255,255,255,0.2)', 
          px: 1, 
          py: 0.5, 
          borderRadius: 1,
          fontSize: '0.8rem'
        }}>
          {tasks.length}
        </Typography>
      </Box>

      {/* Tasks Container */}
      <Box sx={{ 
        flex: 1, 
        p: 1, 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        {tasks.map((task) => (
          <TaskCard 
            key={task._id} 
            task={task} 
            onUpdate={onTaskUpdate}
            onClick={onTaskClick}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default TaskColumn;