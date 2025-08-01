import React, { useEffect, useState } from "react";
import axios from "../axios";
import { Box, CircularProgress, Typography, Alert, Button } from "@mui/material";
import TaskBoard from "./TaskBoard";
import Sidebar from "./Sidebar";
import Header from "./Header";
import usePushNotification from "../hooks/usePushNotification";
import CreateTask from "./CreateTask";
import TaskDetailDialog from "./TaskDetailDialog";
import { sampleTasks } from "../utils/sampleData";
import AddIcon from "@mui/icons-material/Add";

const HomePage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);

  // Initialize push notification subscription when user is loaded
  usePushNotification(user?._id);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [taskRes, userRes] = await Promise.all([
        axios.get("/task"),
        axios.get("/users/profile"),
      ]);
      
      // Handle the API response structure: { success: true, count: number, tasks: [...] }
      const apiTasks = taskRes.data.tasks || [];
      const finalTasks = apiTasks.length > 0 ? apiTasks : sampleTasks;
      setTasks(finalTasks);
      setUser(userRes.data.data);
      
      console.log("✅ API Tasks loaded:", apiTasks.length, "tasks");
      console.log("📋 Final tasks data:", finalTasks);
      
      // Debug: Check pending tasks
      const pendingTasks = finalTasks.filter(t => t.status === 'pending');
      console.log("📋 Pending tasks:", pendingTasks.length, pendingTasks);
      
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      
      // Use sample data if API fails
      setTasks(sampleTasks);
      console.log("📋 Using sample tasks:", sampleTasks.length, "tasks");
      
      // Debug: Check pending tasks in sample data
      const pendingTasks = sampleTasks.filter(t => t.status === 'pending');
      console.log("📋 Sample pending tasks:", pendingTasks.length, pendingTasks);
      
      setError("Using sample data. API connection failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTaskUpdate = () => {
    fetchData();
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setTaskDetailOpen(true);
  };

  const handleTaskDetailClose = () => {
    setTaskDetailOpen(false);
    setSelectedTask(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f5f5f5' }}>
      <Sidebar user={user} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Box sx={{ flex: 1, p: 3, overflow: 'hidden', position: 'relative' }}>
          {/* Single Add Task Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{
              position: 'absolute',
              top: 24,
              right: 24,
              zIndex: 10,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Add Task
          </Button>
          
          {/* Create Task Dialog */}
          <CreateTask
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onTaskCreated={fetchData}
          />

          {/* Task Detail Dialog */}
          <TaskDetailDialog
            open={taskDetailOpen}
            task={selectedTask}
            onClose={handleTaskDetailClose}
            onTaskUpdate={handleTaskUpdate}
          />
          
          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Typography variant="h4" fontWeight="bold" mb={3}>
            Task Board ({tasks.length} tasks)
          </Typography>
          
          {/* Debug info */}
          <Box sx={{ mb: 2, p: 1, backgroundColor: '#f0f0f0', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Debug: Pending tasks: {tasks.filter(t => t.status === 'pending').length} | 
              In-progress: {tasks.filter(t => t.status === 'in-progress').length} | 
              Completed: {tasks.filter(t => t.status === 'completed').length}
            </Typography>
          </Box>
          
          <TaskBoard 
            tasks={tasks} 
            onTaskUpdate={handleTaskUpdate}
            onTaskClick={handleTaskClick}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;