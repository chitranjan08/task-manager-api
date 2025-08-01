import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../axios";
import { disconnectSocket } from "../socket";

import {
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Box,
  TablePagination,
} from "@mui/material";
import moment from "moment";

function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getAdminData = async () => {
    try {
      // const res = await axios.get("http://localhost:3000/logs/admin", {
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem("token")}`,
      //   },
      // });
    const res = await api.get("/logs/admin"); 
      console.log("API response:", res.data);

      const logsArray = Array.isArray(res.data?.data) ? res.data.data : [];
      setLogs(logsArray);
    } catch (err) {
      console.error("Error fetching logs:", err.message);
      alert("Unauthorized. Redirecting to login...");
      window.location.href = "/";
    }
  };

  useEffect(() => {
    getAdminData();
  }, []);

  const handleLogout = () => {
    // Disconnect socket before logout
    disconnectSocket();
    
    // Clear local storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("rememberMe");
    
    // Redirect to login
    window.location.href = "/";
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Activity Logs</Typography>
          <Button variant="contained" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Box>

        {logs.length > 0 ? (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>{log.name}</TableCell>
                      <TableCell>{log.email}</TableCell>
                      <TableCell>{log.role}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.ip}</TableCell>
                      <TableCell>
                        {moment(log.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={logs.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        ) : (
          <Typography>No logs found.</Typography>
        )}
      </Paper>
    </Container>
  );
}

export default Dashboard;
