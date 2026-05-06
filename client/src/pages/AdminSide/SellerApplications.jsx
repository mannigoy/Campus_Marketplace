import React, { useEffect, useState } from "react";
import { Card } from "../../components/Shared";
import { useAuth } from "../../AuthContext";
import "../../styles/admin.css";

const API_BASE = "http://localhost:8080/api";

export default function SellerApplications({ token: tokenProp }) {
  const { token: contextToken } = useAuth();
  const token = tokenProp || contextToken;
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/seller-applications/pending`, {
        headers: { Authorization: `Bearer ${token}` },
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
    if (token) loadApplications();
  }, [token]);

  const handleApprove = async (applicationId) => {
    try {
      const res = await fetch(
        `${API_BASE}/seller-applications/${applicationId}/approve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
    <Card>
      <div className="admin-card-header">
        <div className="admin-card-header-title">Pending Seller Applications</div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="admin-empty">No pending applications.</div>
      ) : (
        <div style={{ display: "grid", gap: 16, padding: "16px" }}>
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
                  style={{
                    maxWidth: 320,
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                />
              )}
              <div className="admin-action-group">
                <button
                  className="btn-primary"
                  onClick={() => handleApprove(app.id)}
                >
                  Approve Seller
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}