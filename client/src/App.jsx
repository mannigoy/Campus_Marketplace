import { Routes, Route, useNavigate } from "react-router-dom";

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Marketplace from "./pages/MarketPlace";
import Contactpage from "./pages/Contactpage";
import AboutUs from "./pages/AboutUs";
import SellerSide from "./pages/SellerSide/SellerSide";
import ShopPage from "./pages/ShopPage";
import SignUpModal from "./Signupmodal";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminSide/AdminDashboard";
import SellerApplication from "./pages/SellerApplication";
import Unauthorized from "./pages/Unauthorized";
import Cart from "./pages/Cart"
import { useAuth } from "./AuthContext";


export default function App() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // 1. Modal State Logic
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const [status, setStatus] = useState("checking...");

  // Check backend status on mount and periodically
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/test", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          setStatus("✓ Online");
        } else {
          setStatus("⚠ Error");
        }
      } catch (error) {
        setStatus("✗ Offline");
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // 2. Route Check Logic
  // Hide main layout elements when on the Seller Dashboard
  // const isSellerDashboard = location.pathname.startsWith("/user/seller");

  // 3. Handlers
  const openSignUp = () => {
    setAuthMode("signup");
    setIsSignUpOpen(true);
  };
  const openSignIn = () => {
    setAuthMode("signin");
    setIsSignUpOpen(true);
  };
  const closeSignUp = () => setIsSignUpOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app-container">
        {/* BACKEND STATUS INDICATOR */}
        <div style={{ textAlign: "center", padding: "8px", background: "#f3f4f6", fontSize: "14px" }}>
          Backend status: <strong>{status}</strong>
        </div>

        {/* NAVBAR:
            We only show this if we aren't in the Seller Dashboard.
            The Sign In button opens the login modal.
        */}
      {/* {!isSellerDashboard && ( */}
        <Navbar
          onOrdersClick={() => navigate("/orders")}
          onSignInClick={openSignIn}
          isLoggedIn={!!user}
          username={user?.username || ""}
          role={user?.role || "CUSTOMER"}
          applicationStatus={user?.applicationStatus || "NONE"}
          onApplySellerClick={() => navigate("/seller-application")}
          onSellerDashboardClick={() => navigate("/seller/dashboard")}
          onLogoutClick={handleLogout}
        />
      {/* )} */}

      {/* MAIN CONTENT AREA */}
      <main className="app-content">
        <Routes>
          {/* Main Shop/Home Page */}
          <Route path="/" element={<ShopPage />} />
          
          {/* Dashboard Page (shown after login) */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Seller Application */}
          <Route
            path="/seller-application"
            element={
              <ProtectedRoute requiredRoles={["CUSTOMER"]}>
                <SellerApplication />
              </ProtectedRoute>
            }
          />
          
          {/* Marketplace/Landing Page */}
          <Route path="/landing_page" element={<Marketplace />} />

          {/* cart page */}
          <Route path="/cart" element={<Cart />} />
          
          {/* Static Pages */}
          <Route path="/contact" element={<Contactpage />} />
          <Route path="/about" element={<AboutUs />} />
          
          {/* Seller Dashboard */}
          <Route
            path="/seller/*"
            element={
              <ProtectedRoute requiredRoles={["SELLER"]}>
                <SellerSide />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRoles={["ADMIN", "SUPERADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* 404 Fallback */}
          <Route path="*" element={<div style={{ padding: "5rem", textAlign: "center" }}><h1>404</h1><p>Page Not Found</p></div>} />
        </Routes>
      </main>

      {/* SIGN UP MODAL:
          Placed outside the Routes so it can overlay any page 
          without unmounting the background content.
      */}
      <SignUpModal 
        isOpen={isSignUpOpen} 
        mode={authMode}
        onClose={closeSignUp} 
        onSwitchToSignIn={openSignIn}
        onSwitchToSignUp={openSignUp}
      />

      {/* FOOTER */}
      {/* {!isSellerDashboard && */}<Footer />{/* } */}
    </div>
  );
}