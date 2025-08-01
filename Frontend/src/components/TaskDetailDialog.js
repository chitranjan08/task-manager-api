import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  IconButton
} from "@mui/material";
import {
  Close as CloseIcon,
  Flag as FlagIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
  History as HistoryIcon
} from "@mui/icons-material";
import axios from "../axios";

const TaskDetailDialog = ({ open, task, onClose, onTaskUpdate }) => {
  const [status, setStatus] = useState(task?.status || "pending");
  const [logMessage, setLogMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    if (task) {
      setStatus(task.status);
      fetchActivityLogs();
    }
  }, [task]);

  const fetchActivityLogs = async () => {
    if (!task?._id) return;

    try {
      const response = await axios.get(`/logs/task-logs?taskId=${task._id}`);
      setActivityLogs(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch activity logs:", err);
    }
  };

  const handleUpdateAndLog = async () => {
    if (!task?._id) return;

    try {
      setLoading(true);
      setError("");

      const logs = [];

      // Status change
      if (status !== task.status) {
        await axios.post(`/task/update`, {
          status: status,
          id: task._id
        });

        logs.push({
          taskId: task._id,
          action: status === "closed" ? "TASK_CLOSED" : "STATUS_CHANGE",
          description:
            status === "closed"
              ? `Task closed`
              : `Status changed to ${status}`,
          details: `Task status updated from ${task.status} to ${status}`
        });
      }

      // Log message
      if (logMessage.trim()) {
        logs.push({
          taskId: task._id,
          action: "LOG_ACTIVITY",
          description: logMessage,
          details: `Activity logged: ${logMessage}`
        });
      }

      // Send logs in parallel
      await Promise.all(logs.map((log) => axios.post("/logs/create", log)));

      setSuccess("Changes saved successfully!");
      setLogMessage("");
      onTaskUpdate();
      fetchActivityLogs();

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "#f44336";
      case "medium":
        return "#ff9800";
      case "low":
        return "#4caf50";
      default:
        return "#ff9800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (!task) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh"
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography variant="h5" fontWeight="bold">
            Task Details
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Task Header */}
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {task.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {task.taskId || `Task-${task._id?.slice(-3)}`}
            </Typography>
          </Box>

          {/* Info Grid */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PersonIcon color="action" />
              <Typography variant="body2">
                <strong>Assigned to:</strong> {task.assignedTo}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ScheduleIcon color="action" />
              <Typography variant="body2">
                <strong>Due Date:</strong> {formatDate(task.dueDate)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FlagIcon sx={{ color: getPriorityColor(task.priority) }} />
              <Typography variant="body2">
                <strong>Priority:</strong> {task.priority}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={task.status}
                size="small"
                sx={{
                  backgroundColor:
                    task.status === "completed"
                      ? "#4caf50"
                      : task.status === "in-progress"
                      ? "#2196f3"
                      : task.status === "closed"
                      ? "#9e9e9e"
                      : "#ff9800",
                  color: "white"
                }}
              />
            </Box>
          </Box>

          {/* Description */}
          {task.description && (
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                <DescriptionIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Description
              </Typography>
              <Typography variant="body2" sx={{ pl: 3 }}>
                {task.description}
              </Typography>
            </Box>
          )}

          <Divider />

          {/* Change Status */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Change Status or Add Log
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="pending">To-do</MenuItem>
                  <MenuItem value="in-progress">In-Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Log Activity */}
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Log your activity or progress..."
            value={logMessage}
            onChange={(e) => setLogMessage(e.target.value)}
            disabled={loading}
          />

          <Button
            variant="contained"
            onClick={handleUpdateAndLog}
            disabled={
              loading || (status === task.status && !logMessage.trim())
            }
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>

          <Divider />

          {/* Activity Logs */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              <HistoryIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Activity Log
            </Typography>
            <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
              {activityLogs.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No activity logs yet
                </Typography>
              ) : (
                activityLogs.map((log, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 2,
                      p: 2,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      {log.action === "STATUS_CHANGE"
                        ? "🔄 Status Changed"
                        : log.action === "TASK_CLOSED"
                        ? "🚫 Task Closed"
                        : "📝 Activity Logged"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {log.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(log.createdAt)}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetailDialog;
