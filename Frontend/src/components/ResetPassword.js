import React, { useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate(); // ✅ navigation hook

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      return setMessage('❌ Passwords do not match.');
    }

    try {
      await axios.post('http://localhost:3000/auth/reset-password', {
        token,
        newPassword: password,
      });

      setMessage('✅ Password reset successful! Redirecting to login...');

      // ✅ Navigate after delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setMessage('❌ Token expired or invalid.');
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8}>
      <Typography variant="h5">Reset Your Password</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="New Password"
          fullWidth
          margin="normal"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <TextField
          label="Confirm Password"
          fullWidth
          margin="normal"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" fullWidth>
          Reset Password
        </Button>
      </form>
      {message && <Alert severity="info" sx={{ mt: 2 }}>{message}</Alert>}
    </Box>
  );
};

export default ResetPassword;
