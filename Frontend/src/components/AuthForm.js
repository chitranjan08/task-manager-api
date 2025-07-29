import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axios";

import {
  TextField,
  Button,
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Divider,
  Stack,
  IconButton,
} from "@mui/material";

import LoginIcon from "@mui/icons-material/Login";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

function AuthForm() {
  const [mode, setMode] = useState(0); // 0 = Login, 1 = Register
  const [theme, setTheme] = useState("dark"); // or "light"
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        await axios.get("/logs/admin");
        navigate("/dashboard");
      } catch (err) {
        localStorage.removeItem("accessToken");
        console.warn("Invalid token. Login again.");
      }
    };

    checkToken();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url =
      mode === 0
        ? "http://localhost:3000/auth/login"
        : "http://localhost:3000/auth/register";

    const data =
      mode === 0
        ? { email: formData.email, password: formData.password }
        : formData;

    try {
      const res = await axios.post(url, data, { withCredentials: true });

      if (mode === 0) {
        localStorage.setItem("accessToken", res.data.accessToken);
        alert("✅ Login successful!");
        navigate("/dashboard");
      } else {
        alert("✅ Registration successful! Now login.");
        setMode(0);
      }
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || err.message));
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `http://localhost:3000/auth/${provider}`;
  };

  // 🎨 Themes
  const isDark = theme === "dark";
  const background = isDark
    ? "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
    : "linear-gradient(135deg, #ece9e6, #ffffff)";
  const textColor = isDark ? "#fff" : "#222";
  const labelColor = isDark ? "#ccc" : "#666";
  const cardColor = isDark ? "rgba(255,255,255,0.06)" : "#fff";
  const border = isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid #ddd";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background,
        backgroundSize: "cover",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          maxWidth: 450,
          width: "100%",
          borderRadius: 3,
          backgroundColor: cardColor,
          color: textColor,
          border,
          position: "relative",
        }}
      >
        <IconButton
          onClick={toggleTheme}
          sx={{ position: "absolute", top: 16, right: 16, color: textColor }}
        >
          {isDark ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>

        <Box textAlign="center" mb={2}>
          <LoginIcon sx={{ fontSize: 40, color: textColor }} />
          <Typography variant="h5" sx={{ fontWeight: "bold", mt: 1 }}>
            {mode === 0 ? "Welcome Back" : "Create Account"}
          </Typography>
          <Typography variant="body2" sx={{ color: labelColor }}>
            {mode === 0 ? "Login to continue" : "Register to get started"}
          </Typography>
        </Box>

        <Tabs
          value={mode}
          onChange={(e, newValue) => setMode(newValue)}
          variant="fullWidth"
          textColor="inherit"
          indicatorColor="secondary"
          sx={{ mb: 2 }}
        >
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        <Box component="form" onSubmit={handleSubmit}>
          {mode === 1 && (
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{ sx: { color: textColor } }}
              InputLabelProps={{ sx: { color: labelColor } }}
            />
          )}
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{ sx: { color: textColor } }}
            InputLabelProps={{ sx: { color: labelColor } }}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{ sx: { color: textColor } }}
            InputLabelProps={{ sx: { color: labelColor } }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              py: 1.3,
              fontWeight: "bold",
              fontSize: "1rem",
              color: "#fff",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
              },
            }}
          >
            {mode === 0 ? "Login" : "Register"}
          </Button>
        </Box>

        <Divider sx={{ my: 3, borderColor: isDark ? "rgba(255,255,255,0.2)" : "#ccc" }}>
          OR
        </Divider>

        <Stack spacing={1.5}>
          <Button
            onClick={() => handleSocialLogin("google")}
            startIcon={<GoogleIcon />}
            fullWidth
            variant="outlined"
            sx={{
              color: textColor,
              borderColor: labelColor,
              "&:hover": { borderColor: textColor },
            }}
          >
            Continue with Google
          </Button>
          <Button
            onClick={() => handleSocialLogin("facebook")}
            startIcon={<FacebookIcon />}
            fullWidth
            variant="outlined"
            sx={{
              color: textColor,
              borderColor: labelColor,
              "&:hover": { borderColor: textColor },
            }}
          >
            Continue with Facebook
          </Button>
          <Button
            onClick={() => handleSocialLogin("linkedin")}
            startIcon={<LinkedInIcon />}
            fullWidth
            variant="outlined"
            sx={{
              color: textColor,
              borderColor: labelColor,
              "&:hover": { borderColor: textColor },
            }}
          >
            Continue with LinkedIn
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default AuthForm;
