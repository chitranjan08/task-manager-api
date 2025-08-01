import React, { useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Typography,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  MoreVert as MoreVertIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { disconnectSocket } from "../socket";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState("");
  const [labelFilter, setLabelFilter] = useState("");

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const clearFilters = () => {
    setPriorityFilter("");
    setLabelFilter("");
    setSearchQuery("");
  };

  const handleLogout = () => {
    // Disconnect socket before logout
    disconnectSocket();
    
    // Clear local storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("rememberMe");
    
    // Redirect to login
    window.location.href = "/";
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        backgroundColor: "white",
        borderBottom: "1px solid #e0e0e0",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {/* Search Bar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <TextField
          placeholder="Search Task..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{
            width: 300,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Filter Controls and Logout */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<FilterIcon />}
          onClick={() => setPriorityFilter(priorityFilter ? "" : "high")}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            borderColor: priorityFilter ? "#1976d2" : "#e0e0e0",
            color: priorityFilter ? "#1976d2" : "#666",
          }}
        >
          PRIORITY
        </Button>

        <Button
          variant="outlined"
          size="small"
          startIcon={<FilterIcon />}
          onClick={() => setLabelFilter(labelFilter ? "" : "bug")}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            borderColor: labelFilter ? "#1976d2" : "#e0e0e0",
            color: labelFilter ? "#1976d2" : "#666",
          }}
        >
          LABELS
        </Button>

        {(priorityFilter || labelFilter) && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<ClearIcon />}
            onClick={clearFilters}
            sx={{
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            CLEAR FILTERS
          </Button>
        )}

        {/* Logout Button */}
        <Button
          variant="contained"
          color="error"
          size="small"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            ml: 1,
          }}
        >
          Logout
        </Button>

        <IconButton onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>Export Tasks</MenuItem>
          <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
          <MenuItem onClick={handleMenuClose}>Help</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Header;