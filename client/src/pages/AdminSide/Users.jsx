import React, { useEffect, useState } from "react";
import { Card } from "../../components/Shared";
import { useAuth } from "../../AuthContext";
import "../../styles/admin.css";

const API_BASE = "http://localhost:8080/api";

export default function Users({ token: tokenProp }) {
  const { token: contextToken } = useAuth();
  const token = tokenProp || contextToken;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load users.");
        setUsers([]);
        return;
      }
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setError("Cannot reach server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadUsers();
  }, [token]);

  return (
    <Card>
      <div className="admin-card-header">
        <div className="admin-card-header-title">All Users</div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="admin-empty">No users found.</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              {["ID", "Username", "Email", "Role", "Store"].map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username || "—"}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.storeName || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}