import React from "react";
import { Grid, Box } from "@mui/material";
import TaskColumn from "./TaskColumn";

// Map backend status values to display labels - matching the actual API
const STATUS_COLUMNS = [
  { value: "pending", label: "To-do", color: "#ef6c00" },
  { value: "in-progress", label: "In-Progress", color: "#0d47a1" },
  { value: "completed", label: "Completed", color: "#1b5e20" }
];

const TaskBoard = ({ tasks, onTaskUpdate, onTaskClick }) => {
  console.log("📋 TaskBoard received tasks:", tasks);
  
  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      height: 'calc(100vh - 200px)', 
      overflowX: 'auto',
      pb: 2
    }}>
      {STATUS_COLUMNS.map((col) => {
        const filteredTasks = tasks.filter((t) => t.status === col.value);
        console.log(`📋 ${col.label} column (${col.value}):`, filteredTasks.length, "tasks");
        
        return (
          <Box
            key={col.value}
            sx={{
              minWidth: 280,
              maxWidth: 280,
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <TaskColumn
              title={col.label}
              tasks={filteredTasks}
              color={col.color}
              onTaskUpdate={onTaskUpdate}
              onTaskClick={onTaskClick}
            />
          </Box>
        );
      })}
    </Box>
  );
};

export default TaskBoard;