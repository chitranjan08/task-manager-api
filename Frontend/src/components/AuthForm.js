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
  Alert,
  CircularProgress,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Link,
  Fade,
  Zoom,
} from "@mui/material";

import {
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

function AuthForm() {
  const [mode, setMode] = useState(0); // 0 = Login, 1 = Register
  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "",
    confirmPassword: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        await axios.get("/users/profile");
        navigate("/home");
      } catch (err) {
        localStorage.removeItem("accessToken");
        console.warn("Invalid token. Login again.");
      }
    };

    checkToken();
  }, [navigate]);

  // Clear messages when switching modes
  useEffect(() => {
    setError("");
    setSuccess("");
    setFormErrors({});
  }, [mode]);

  const validateForm = () => {
    const errors = {};
    
    if (mode === 1) {
      if (!formData.name.trim()) {
        errors.name = "Full name is required";
      } else if (formData.name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters";
      }
    }

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (mode === 1 && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    // Clear general error when user makes changes
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const url = mode === 0 ? "/auth/login" : "/auth/register";
    const data = mode === 0 
      ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      try {
        const res = await axios.post(url, data, { withCredentials: true });
        
        if (mode === 0) {
          localStorage.setItem("accessToken", res.data.accessToken);
          if (rememberMe) {
            localStorage.setItem("rememberMe", "true");
          }
          setSuccess("✅ Login successful! Redirecting...");
          setTimeout(() => navigate("/home"), 1500);
        } else {
          setSuccess("✅ Registration successful! Please login.");
          setTimeout(() => setMode(0), 2000);
        }
      } catch (err) {
        console.error("Auth error:", err);
        setError(err.response?.data?.message || "An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const handleSocialLogin = (provider) => {
      setLoading(true);
      setError("");
      window.location.href = `${process.env.REACT_APP_API_URL || "http://localhost:3000"}/auth/${provider}`;
    };

    //  Fixed Theme Colors
    const isDark = theme === "dark";
    const background = isDark
      ? "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)"
      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    
    // Fixed color scheme for light theme
    const textColor = isDark ? "#fff" : "#333";
    const labelColor = isDark ? "#ccc" : "#666";
    const cardColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.95)";
    const border = isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.3)";
    
    // Additional colors for better contrast
    const inputBgColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)";
    const iconColor = isDark ? "#ccc" : "#666";
    const linkColor = "#667eea";

    // Enhanced input field styling
    const inputFieldStyle = {
      "& .MuiOutlinedInput-root": {
        backgroundColor: inputBgColor,
        borderRadius: 2,
        transition: "all 0.3s ease",
        "& fieldset": {
          borderColor: labelColor,
          borderWidth: "2px",
          transition: "all 0.3s ease",
        },
        "&:hover fieldset": {
          borderColor: linkColor,
          borderWidth: "2px",
        },
        "&.Mui-focused fieldset": {
          borderColor: linkColor,
          borderWidth: "3px",
          boxShadow: `0 0 0 2px ${linkColor}20`,
        },
      },
      "& .MuiInputLabel-root": {
        color: labelColor,
        "&.Mui-focused": {
          color: linkColor,
          fontWeight: 600,
        },
      },
      "& .MuiFormHelperText-root": {
        color: "#f44336",
        fontSize: "0.75rem",
      },
    };

    const errorFieldStyle = {
      "& .MuiOutlinedInput-root": {
        backgroundColor: inputBgColor,
        borderRadius: 2,
        transition: "all 0.3s ease",
        "& fieldset": {
          borderColor: "#f44336",
          borderWidth: "2px",
        },
        "&:hover fieldset": {
          borderColor: "#f44336",
          borderWidth: "2px",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#f44336",
          borderWidth: "3px",
          boxShadow: `0 0 0 2px #f4433620`,
        },
      },
      "& .MuiInputLabel-root": {
        color: "#f44336",
        "&.Mui-focused": {
          color: "#f44336",
          fontWeight: 600,
        },
      },
      "& .MuiFormHelperText-root": {
        color: "#f44336",
        fontSize: "0.75rem",
      },
    };

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
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated Background Elements */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"25\" cy=\"25\" r=\"1\" fill=\"white\"/><circle cx=\"75\" cy=\"75\" r=\"1\" fill=\"white\"/><circle cx=\"50\" cy=\"10\" r=\"0.5\" fill=\"white\"/><circle cx=\"10\" cy=\"60\" r=\"0.5\" fill=\"white\"/><circle cx=\"90\" cy=\"40\" r=\"0.5\" fill=\"white\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>')",
            animation: "float 20s ease-in-out infinite",
          }}
        />

        <Zoom in={true} timeout={800}>
          <Paper
            elevation={24}
            sx={{
              p: 3, // Reduced from p: 4
              maxWidth: 400, // Reduced from 450
              width: "100%",
              borderRadius: 4,
              backgroundColor: cardColor,
              color: textColor,
              border,
              position: "relative",
              backdropFilter: "blur(10px)",
              boxShadow: isDark 
                ? "0 25px 50px rgba(0,0,0,0.5)" 
                : "0 25px 50px rgba(0,0,0,0.2)",
            }}
          >
          {/* Theme Toggle */}
          <IconButton
            onClick={toggleTheme}
            sx={{ 
              position: "absolute", 
              top: 12, // Reduced from 16
              right: 12, // Reduced from 16
              color: textColor,
              backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              backdropFilter: "blur(10px)",
              "&:hover": {
                backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
              }
            }}
          >
            {isDark ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* Header */}
          <Box textAlign="center" mb={2}>
            <Fade in={true} timeout={1000}>
              <Box>
                {mode === 0 ? (
                  <LoginIcon sx={{ fontSize: 40, color: textColor, mb: 0.5 }} />
                ) : (
                  <RegisterIcon sx={{ fontSize: 40, color: textColor, mb: 0.5 }} />
                )}
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 0.5 }}>
                  {mode === 0 ? "Welcome Back" : "Create Account"}
                </Typography>
                <Typography variant="body2" sx={{ color: labelColor }}>
                  {mode === 0 ? "Sign in to continue" : "Join us and start managing tasks"}
                </Typography>
              </Box>
            </Fade>
          </Box>

          {/* Tabs */}
          <Tabs
            value={mode}
            onChange={(e, newValue) => setMode(newValue)}
            variant="fullWidth"
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ 
              mb: 2, // Reduced from mb: 3
              "& .MuiTab-root": {
                fontSize: "0.95rem", // Reduced from 1rem
                fontWeight: 600,
                color: textColor,
                py: 1, // Reduced padding
              },
              "& .MuiTabs-indicator": {
                backgroundColor: linkColor,
                height: 3,
              }
            }}
          >
            <Tab label="Sign In" />
            <Tab label="Sign Up" />
          </Tabs>

          {/* Error/Success Messages */}
          {error && (
            <Alert 
              severity="error" 
              icon={<ErrorIcon />}
              sx={{ mb: 1.5, borderRadius: 2 }} // Reduced from mb: 2
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert 
              severity="success" 
              icon={<CheckCircleIcon />}
              sx={{ mb: 1.5, borderRadius: 2 }} // Reduced from mb: 2
            >
              {success}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {mode === 1 && (
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="dense" // Changed from "normal"
                required
                error={!!formErrors.name}
                helperText={formErrors.name}
                InputProps={{ 
                  sx: { color: textColor },
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: iconColor }} />
                    </InputAdornment>
                  ),
                }}
                sx={formErrors.name ? errorFieldStyle : inputFieldStyle}
              />
            )}
            
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="dense" // Changed from "normal"
              required
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{ 
                sx: { color: textColor },
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: iconColor }} />
                  </InputAdornment>
                ),
              }}
              sx={formErrors.email ? errorFieldStyle : inputFieldStyle}
            />
            
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              margin="dense" // Changed from "normal"
              required
              error={!!formErrors.password}
              helperText={formErrors.password}
              InputProps={{ 
                sx: { color: textColor },
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: iconColor }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      sx={{ color: iconColor }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={formErrors.password ? errorFieldStyle : inputFieldStyle}
            />

            {mode === 1 && (
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="dense" // Changed from "normal"
                required
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                InputProps={{ 
                  sx: { color: textColor },
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: iconColor }} />
                    </InputAdornment>
                  ),
                }}
                sx={formErrors.confirmPassword ? errorFieldStyle : inputFieldStyle}
              />
            )}

            {mode === 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}> {/* Reduced from mt: 1 */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{ 
                        color: iconColor,
                        "&.Mui-checked": {
                          color: linkColor,
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: labelColor }}>
                      Remember me
                    </Typography>
                  }
                />
                <Link
                  href="#"
                  variant="body2"
                  sx={{ 
                    color: linkColor,
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Forgot password?
                </Link>
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{
                mt: 2, // Reduced from mt: 3
                py: 1.2, // Reduced from py: 1.5
                fontWeight: "bold",
                fontSize: "1rem", // Reduced from 1.1rem
                color: "#fff",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: 3,
                textTransform: "none",
                boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                  boxShadow: "0 12px 35px rgba(102, 126, 234, 0.4)",
                  transform: "translateY(-2px)",
                },
                "&:disabled": {
                  background: "rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.5)",
                },
                transition: "all 0.3s ease",
              }}
            >
              {loading ? "Please wait..." : (mode === 0 ? "Sign In" : "Create Account")}
            </Button>
          </Box>

          <Divider sx={{ my: 2, borderColor: labelColor }}> {/* Reduced from my: 3 */}
            <Typography variant="body2" sx={{ color: labelColor, px: 2 }}>
              OR
            </Typography>
          </Divider>

          {/* Social Login - Single Row */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}> {/* Reduced from mb: 3 */}
            <Button
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
              startIcon={<GoogleIcon />}
              variant="outlined"
              sx={{
                color: textColor,
                borderColor: labelColor,
                py: 1, // Reduced from py: 1.2
                borderRadius: 3,
                textTransform: "none",
                fontSize: "0.85rem", // Reduced from 0.9rem
                backgroundColor: inputBgColor,
                flex: 1,
                minWidth: 0,
                "&:hover": { 
                  borderColor: linkColor,
                  backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                },
                "&:disabled": {
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.5)",
                },
              }}
            >
              Google
            </Button>
            
            <Button
              onClick={() => handleSocialLogin("facebook")}
              disabled={loading}
              startIcon={<FacebookIcon />}
              variant="outlined"
              sx={{
                color: textColor,
                borderColor: labelColor,
                py: 1, // Reduced from py: 1.2
                borderRadius: 3,
                textTransform: "none",
                fontSize: "0.85rem", // Reduced from 0.9rem
                backgroundColor: inputBgColor,
                flex: 1,
                minWidth: 0,
                "&:hover": { 
                  borderColor: linkColor,
                  backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                },
                "&:disabled": {
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.5)",
                },
              }}
            >
              Facebook
            </Button>
            
            <Button
              onClick={() => handleSocialLogin("linkedin")}
              disabled={loading}
              startIcon={<LinkedInIcon />}
              variant="outlined"
              sx={{
                color: textColor,
                borderColor: labelColor,
                py: 1, // Reduced from py: 1.2
                borderRadius: 3,
                textTransform: "none",
                fontSize: "0.85rem", // Reduced from 0.9rem
                backgroundColor: inputBgColor,
                flex: 1,
                minWidth: 0,
                "&:hover": { 
                  borderColor: linkColor,
                  backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                },
                "&:disabled": {
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.5)",
                },
              }}
            >
              LinkedIn
            </Button>
          </Box>

          {/* Footer */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: labelColor }}>
              {mode === 0 ? "Don't have an account? " : "Already have an account? "}
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setMode(mode === 0 ? 1 : 0);
                }}
                sx={{ 
                  color: linkColor,
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                {mode === 0 ? "Sign up" : "Sign in"}
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Zoom>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
        `}
      </style>
    </Box>
  );
}

export default AuthForm;
