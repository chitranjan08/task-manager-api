import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  MenuItem,
  Paper,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Chip,
  OutlinedInput,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Flag as FlagIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import axios from "../axios";

const CreateTask = ({ open, onClose, onTaskCreated }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "", // This should be email, not user ID
    dueDate: "",
    priority: "Medium",
    status: "pending", // Backend expects: pending, in-progress, completed
  });

  const steps = ["Basic Info", "Assignment", "Details"];

  const priorities = [
    { value: "Low", color: "#4caf50", icon: "��" },
    { value: "Medium", color: "#ff9800", icon: "��" },
    { value: "High", color: "#f44336", icon: "🔴" },
  ];

  const statuses = [
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/users");
        setUsers(res.data.users || []);
      } catch (err) {
        console.error("Error fetching users", err);
        setError("Failed to load users");
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(""); // Clear error when user makes changes
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted!"); // Debug log
    setLoading(true);
    setError("");

    try {
      // Prepare data according to backend expectations
      const taskData = {
        title: form.title,
        description: form.description || "",
        assignedTo: form.assignedTo, // This should be email
        dueDate: new Date(form.dueDate).toISOString(),
        priority: form.priority,
        status: form.status,
      };

      console.log("Sending task data:", taskData); // Debug log

      const res = await axios.post("/task/create", taskData);
      
      console.log("Task created successfully:", res.data); // Debug log
      
      // Reset form
      setForm({
        title: "",
        description: "",
        assignedTo: "",
        dueDate: "",
        priority: "Medium",
        status: "pending",
      });
      
      setActiveStep(0);
      onTaskCreated?.(res.data.task);
      onClose();
      
    } catch (err) {
      console.error("❌ Failed to create task", err);
      console.error("Error response:", err.response?.data); // Debug log
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      title: "",
      description: "",
      assignedTo: "",
      dueDate: "",
      priority: "Medium",
      status: "pending",
    });
    setActiveStep(0);
    setError("");
    onClose();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Task Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                fullWidth
                required
                placeholder="Enter task title..."
                InputProps={{
                  startAdornment: <DescriptionIcon sx={{ mr: 1, color: "action.active" }} />,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                placeholder="Describe the task in detail..."
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  label="Status"
                >
                  {statuses.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  name="assignedTo"
                  value={form.assignedTo}
                  onChange={handleChange}
                  label="Assign To"
                  required
                  startAdornment={<PersonIcon sx={{ mr: 1, color: "action.active" }} />}
                >
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user.email}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: "12px" }}>
                          {user.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{user.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                type="date"
                label="Due Date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarIcon sx={{ mr: 1, color: "action.active" }} />,
                }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  label="Priority"
                  startAdornment={<FlagIcon sx={{ mr: 1, color: "action.active" }} />}
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <span>{priority.icon}</span>
                        <Typography>{priority.value}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Task Summary
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Title:</Typography>
                    <Typography variant="body2">{form.title || "Not specified"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Status:</Typography>
                    <Typography variant="body2">
                      {statuses.find(s => s.value === form.status)?.label || "Not specified"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Assigned To:</Typography>
                    <Typography variant="body2">
                      {users.find(u => u.email === form.assignedTo)?.name || "Not assigned"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Due Date:</Typography>
                    <Typography variant="body2">
                      {form.dueDate ? new Date(form.dueDate).toLocaleDateString() : "Not set"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Priority:</Typography>
                    <Typography variant="body2">{form.priority}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5" fontWeight="bold">
            Create New Task
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          
          {activeStep > 0 && (
            <Button onClick={handleBack} disabled={loading}>
              Back
            </Button>
          )}
          
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!form.title || loading}
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              disabled={!form.title || !form.assignedTo || !form.dueDate || loading}
              startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
            >
              {loading ? "Creating..." : "Create Task"}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateTask;