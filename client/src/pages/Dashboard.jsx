import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    // If not logged in, redirect to home
    navigate("/");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="welcome-card">
          <div className="welcome-emoji">👋</div>
          <h1 className="welcome-title">Hi, {user.username}!</h1>
          <p className="welcome-subtitle">Welcome to Campus Marketplace</p>
          
          <div className="user-info">
            <div className="info-item">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            <div className="info-item">
              <label>Username:</label>
              <span>{user.username}</span>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-primary" onClick={() => navigate("/")}>
              Go to Marketplace
            </button>
            {user.role === "CUSTOMER" && user.applicationStatus !== "PENDING" && (
              <button className="btn-secondary" onClick={() => navigate("/seller-application")}>
                Apply to be a Seller
              </button>
            )}
            {user.role === "CUSTOMER" && user.applicationStatus === "PENDING" && (
              <button className="btn-secondary" disabled>
                Application Pending
              </button>
            )}
            {user.role === "SELLER" && (
              <button className="btn-secondary" onClick={() => navigate("/seller/dashboard")}>
                Go to Seller Dashboard
              </button>
            )}
            <button className="btn-logout" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
