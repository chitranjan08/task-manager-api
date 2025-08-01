import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import KanbanCard from "./KanbanCard";
import CreateTask from "./CreateTask";

const KanbanColumn = ({ title, color, count, tasks, onTaskUpdate, isFirstColumn }) => {
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  const handleTaskCreated = (newTask) => {
    onTaskUpdate?.();
  };

  return (
    <>
      <Box
        sx={{
          minWidth: 280,
          backgroundColor: "#f8f9fa",
          borderRadius: 2,
          p: 2,
          display: "flex",
          flexDirection: "column",
          height: "fit-content",
          maxHeight: "calc(100vh - 200px)",
          overflow: "hidden",
        }}
      >
        {/* Column Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: color,
                borderRadius: "50%",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#333",
                fontSize: "14px",
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                backgroundColor: "#e0e0e0",
                borderRadius: "12px",
                px: 1,
                py: 0.5,
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {count}
            </Typography>
          </Box>
        </Box>

        {/* Add Task Button - Only show in first column */}
        {isFirstColumn && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setCreateTaskOpen(true)}
            sx={{
              mb: 2,
              textTransform: "none",
              borderColor: "#ddd",
              color: "#666",
              "&:hover": {
                borderColor: color,
                color: color,
              },
            }}
          >
            Add Task
          </Button>
        )}

        {/* Task Cards */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            overflowY: "auto",
            flex: 1,
          }}
        >
          {tasks.map((task) => (
            <KanbanCard key={task._id} task={task} onUpdate={onTaskUpdate} />
          ))}
          {tasks.length === 0 && (
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                color: "#999",
                fontSize: "14px",
              }}
            >
              No tasks in this column
            </Box>
          )}
        </Box>
      </Box>

      {/* Create Task Dialog */}
      <CreateTask
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
    </>
  );
};

export default KanbanColumn;