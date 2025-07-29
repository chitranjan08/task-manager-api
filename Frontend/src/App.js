// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import initInactivityTimer from "./inactivityTimer"; // ✅ import timer initializer
import SocialLoginSuccess from "./components/SocialLoginSuccess";
function App() {
  useEffect(() => {
    initInactivityTimer(); // ✅ start timer on app load
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/social-login-success" element={<SocialLoginSuccess />} /> {/* ✅ Add this */}
      </Routes>
    </Router>
  );
}

export default App;
