import React, { createContext, useContext, useState } from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const nextNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: "success",
      ...notification,
    };
    setNotifications((prev) => [nextNotification, ...prev].slice(0, 6));
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
