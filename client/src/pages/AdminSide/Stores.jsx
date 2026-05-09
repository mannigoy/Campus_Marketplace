import React, { useEffect, useState } from "react";
import { Card, StatusBadge } from "../../components/Shared";
import { useAuth } from "../../AuthContext";
import "../../styles/admin.css";

const API_BASE = "http://localhost:8080/api";

export default function Stores({ token: tokenProp, users: usersProp = [], onLoadUsers }) {
  const { token: contextToken } = useAuth();
  const token = tokenProp || contextToken;
  const [localUsers, setLocalUsers] = useState([]);
  const users = usersProp.length > 0 ? usersProp : localUsers;
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editingStoreId, setEditingStoreId] = useState(null);
  const [storeForm, setStoreForm] = useState({ storeName: "", description: "" });

  const [showStoreForm, setShowStoreForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState({ storeName: "", description: "", ownerId: "" });

  const loadStores = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/stores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load stores.");
        setStores([]);
        return;
      }
      setStores(Array.isArray(data) ? data : []);
    } catch {
      setError("Cannot reach server.");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load users.");
        setLocalUsers([]);
        return;
      }
      setLocalUsers(Array.isArray(data) ? data : []);
    } catch {
      setError("Cannot reach server.");
      setLocalUsers([]);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadStores();
    if (usersProp.length === 0) {
      if (onLoadUsers) {
        onLoadUsers();
      } else {
        loadUsers();
      }
    }
  }, [token, onLoadUsers, usersProp.length]);

  const getStoreStatus = (store) => {
    const raw = store.status;
    if (!raw) return "Active";
    const n = String(raw).toLowerCase();
    if (n === "active") return "Active";
    if (n === "suspended") return "Suspended";
    if (n === "inactive") return "Inactive";
    return raw;
  };

  const resetCreateForm = () => {
    setCreateForm({ storeName: "", description: "", ownerId: "" });
    setCreateError("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError("");
    if (!createForm.storeName.trim()) { setCreateError("Store name is required."); return; }
    if (!createForm.ownerId) { setCreateError("Owner is required."); return; }

    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/admin/stores`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          storeName: createForm.storeName.trim(),
          description: createForm.description.trim() || null,
          ownerId: Number(createForm.ownerId),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setCreateError(data.error || "Failed to create store."); return; }
      setStores((prev) => [data, ...prev]);
      setShowStoreForm(false);
      resetCreateForm();
    } catch {
      setCreateError("Cannot reach server.");
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (store) => {
    const current = String(store.status || "ACTIVE").toUpperCase();
    const next = current === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    try {
      const res = await fetch(`${API_BASE}/admin/stores/${store.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to update store status."); return; }
      setStores((prev) => prev.map((s) => (s.id === store.id ? data : s)));
    } catch {
      setError("Cannot reach server.");
    }
  };

  const startEdit = (store) => {
    setEditingStoreId(store.id);
    setStoreForm({ storeName: store.storeName || "", description: store.description || "" });
  };

  const saveStore = async (storeId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/stores/${storeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ storeName: storeForm.storeName, description: storeForm.description }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to update store."); return; }
      setStores((prev) => prev.map((s) => (s.id === storeId ? data : s)));
      setEditingStoreId(null);
    } catch {
      setError("Cannot reach server.");
    }
  };

  return (
    <>
      {/* Create Store Modal */}
      {showStoreForm && (
        <div className="admin-modal-overlay">
          <Card style={{ width: 520, maxWidth: "95vw" }}>
            <form onSubmit={handleCreate} className="admin-modal-form">
              <div className="admin-modal-title">Add Store</div>
              <div className="admin-form-field">
                <label htmlFor="store-name" className="admin-form-label">Store Name</label>
                <input
                  id="store-name"
                  className="admin-form-input"
                  value={createForm.storeName}
                  onChange={(e) => setCreateForm((p) => ({ ...p, storeName: e.target.value }))}
                  placeholder="Campus Coffee"
                />
              </div>
              <div className="admin-form-field">
                <label htmlFor="store-owner" className="admin-form-label">Owner</label>
                <select
                  id="store-owner"
                  className="admin-form-select"
                  value={createForm.ownerId}
                  onChange={(e) => setCreateForm((p) => ({ ...p, ownerId: e.target.value }))}
                >
                  <option value="">Select owner</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {(user.username || user.email) + (user.role ? ` · ${user.role}` : "")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-form-field">
                <label htmlFor="store-description" className="admin-form-label">Description</label>
                <textarea
                  id="store-description"
                  className="admin-form-textarea"
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Short store description"
                />
              </div>
              {createError && <div className="admin-error" style={{ borderRadius: 8 }}>{createError}</div>}
              <div className="admin-form-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowStoreForm(false); resetCreateForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? "Saving..." : "Create Store"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Main Card */}
      <Card>
        <div className="admin-card-header">
          <div className="admin-card-header-title">Stores</div>
          <button className="btn-primary" onClick={() => { setShowStoreForm(true); setCreateError(""); }}>
            + Add Store
          </button>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {loading ? (
          <div className="admin-loading">Loading stores...</div>
        ) : stores.length === 0 ? (
          <div className="admin-empty">No stores found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                {["Store", "Owner", "Application", "Status", "Created", "Actions"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => {
                const statusLabel = getStoreStatus(store);
                const isSuspended = statusLabel === "Suspended" || statusLabel === "Inactive";
                return (
                  <tr key={store.id}>
                    <td>
                      {editingStoreId === store.id ? (
                        <>
                          <input
                            className="admin-inline-input"
                            value={storeForm.storeName}
                            onChange={(e) => setStoreForm((p) => ({ ...p, storeName: e.target.value }))}
                          />
                          <textarea
                            className="admin-inline-textarea"
                            rows={2}
                            value={storeForm.description}
                            onChange={(e) => setStoreForm((p) => ({ ...p, description: e.target.value }))}
                            placeholder="Store description"
                            style={{ marginTop: 6 }}
                          />
                        </>
                      ) : (
                        store.storeName
                      )}
                    </td>
                    <td>{store.ownerUsername || store.ownerEmail || "—"}</td>
                    <td>{store.applicationStatus || "—"}</td>
                    <td><StatusBadge status={statusLabel} /></td>
                    <td>{store.createdAt ? new Date(store.createdAt).toLocaleDateString() : "—"}</td>
                    <td>
                      {editingStoreId === store.id ? (
                        <div className="admin-action-group">
                          <button className="btn-sm-primary" onClick={() => saveStore(store.id)}>Save</button>
                          <button className="btn-sm-secondary" onClick={() => setEditingStoreId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <div className="admin-action-group">
                          <button className="btn-sm-primary" onClick={() => startEdit(store)}>Edit Store</button>
                          <button
                            className={isSuspended ? "btn-sm-primary" : "btn-sm-danger"}
                            onClick={() => toggleStatus(store)}
                          >
                            {isSuspended ? "Restore Store" : "Suspend Store"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}