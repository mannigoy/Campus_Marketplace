import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";

const API_BASE = "http://localhost:8080/api";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/seller-applications/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load applications.");
        setApplications([]);
        return;
      }
      setApplications(data);
    } catch {
      setError("Cannot reach server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadApplications();
    }
  }, [token]);

  const handleApprove = async (applicationId) => {
    try {
      const res = await fetch(`${API_BASE}/seller-applications/${applicationId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to approve application.");
        return;
      }
      setApplications((prev) => prev.filter((item) => item.id !== applicationId));
    } catch {
      setError("Cannot reach server.");
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px" }}>
      <h1 style={{ marginBottom: 8 }}>Admin Dashboard</h1>
      <p style={{ marginTop: 0, color: "#6b7280" }}>Pending Seller Applications</p>

      {error && (
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px 16px", borderRadius: 8 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: "16px 0" }}>Loading applications...</div>
      ) : applications.length === 0 ? (
        <div style={{ padding: "16px 0" }}>No pending applications.</div>
      ) : (
        <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
          {applications.map((app) => (
            <div
              key={app.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 16,
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ fontWeight: 600 }}>{app.shopName}</div>
              <div style={{ color: "#374151" }}>
                Applicant: {app.username || app.email}
              </div>
              {app.reason && (
                <div style={{ color: "#6b7280" }}>Reason: {app.reason}</div>
              )}
              {app.studentIdImage && (
                <img
                  src={app.studentIdImage}
                  alt="Student ID"
                  style={{ maxWidth: 320, borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
              )}
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => handleApprove(app.id)}
                  style={{
                    background: "#111827",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 12px",
                    cursor: "pointer",
                  }}
                >
                  Approve Seller
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
