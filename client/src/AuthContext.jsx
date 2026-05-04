import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    const savedEmail = localStorage.getItem("email");
    const savedRole = localStorage.getItem("role");
    const savedApprovedSeller = localStorage.getItem("isApprovedSeller");
    const savedUserId = localStorage.getItem("userId");
    const savedApplicationStatus = localStorage.getItem("applicationStatus");

    if (savedToken && savedEmail) {
      setToken(savedToken);
      setUser({
        username: savedUsername || "",
        email: savedEmail,
        role: savedRole || "CUSTOMER",
        isApprovedSeller: savedApprovedSeller === "true",
        applicationStatus: savedApplicationStatus || "NONE",
        id: savedUserId ? Number(savedUserId) : null,
      });
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    const {
      email,
      username,
      role = "CUSTOMER",
      isApprovedSeller = false,
      applicationStatus = "NONE",
      id = null,
    } = userData;
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    localStorage.setItem("username", username || "");
    localStorage.setItem("role", role);
    localStorage.setItem("isApprovedSeller", String(!!isApprovedSeller));
    localStorage.setItem("applicationStatus", applicationStatus || "NONE");
    if (id !== null && id !== undefined) {
      localStorage.setItem("userId", String(id));
    }
    setToken(token);
    setUser({
      username,
      email,
      role,
      isApprovedSeller: !!isApprovedSeller,
      applicationStatus: applicationStatus || "NONE",
      id,
    });
  };

  const updateUser = (updates) => {
    if (!user) return;
    const nextUser = { ...user, ...updates };
    setUser(nextUser);
    if (nextUser.role) localStorage.setItem("role", nextUser.role);
    if (nextUser.applicationStatus) {
      localStorage.setItem("applicationStatus", nextUser.applicationStatus);
    }
    if (nextUser.isApprovedSeller !== undefined) {
      localStorage.setItem("isApprovedSeller", String(!!nextUser.isApprovedSeller));
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("isApprovedSeller");
    localStorage.removeItem("userId");
    localStorage.removeItem("applicationStatus");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
