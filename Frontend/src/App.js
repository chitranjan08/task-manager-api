import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import initInactivityTimer from "./inactivityTimer";
import SocialLoginSuccess from "./components/SocialLoginSuccess";
import CreateTask from "./components/CreateTask";
import NotificationHandler from "./components/NotificationHandler";
import HomePage from "./components/HomePage";
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
function App() {
  useEffect(() => {
    initInactivityTimer();
  }, []);

  return (
    <Router>
      <NotificationHandler />
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/social-login-success" element={<SocialLoginSuccess />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-task"
          element={
            <PrivateRoute>
              <CreateTask />
            </PrivateRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
