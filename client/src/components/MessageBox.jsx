import React from "react";

export default function MessageBox({ type = "success", text, onClose }) {
  if (!text) return null;

  return (
    <div className={`message-box message-box-${type}`} role="status" aria-live="polite">
      <div className="message-box-content">
        <span className="message-box-icon">{type === "success" ? "✓" : "!"}</span>
        <span className="message-box-text">{text}</span>
      </div>
      <button type="button" className="message-box-close" onClick={onClose} aria-label="Close message">
        ×
      </button>
    </div>
  );
}