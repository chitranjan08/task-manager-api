// src/components/SocialLoginSuccess.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SocialLoginSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const accessToken = params.get("accessToken");

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      navigate("/dashboard");
    } else {
      // Instead of alert, render a UI or toast
      navigate("/", { state: { error: "Login failed. No token received." } });
    }
  }, [navigate]);

  return <div>🔄 Logging in...</div>;
}



export default SocialLoginSuccess;
