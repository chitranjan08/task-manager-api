import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/auth/forgot-password', { email });
      setMessage('✅ Reset link sent! Check your email.');
    } catch (error) {
      setMessage('❌ Error sending reset link.');
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8}>
      <Typography variant="h5">Forgot Password</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" fullWidth>
          Send Reset Link
        </Button>
      </form>
      {message && <Alert severity="info" sx={{ mt: 2 }}>{message}</Alert>}
    </Box>
  );
};

export default ForgotPassword;
