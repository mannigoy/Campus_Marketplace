import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, StatusBadge } from "../../components/Shared";
import { useAuth } from "../../AuthContext";
import "../../styles/admin.css";

const API_BASE = "http://localhost:8080/api";

const MAX_IMAGE_SIZE_MB = 30;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dlljmtv5g";
const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";
const CLOUDINARY_FOLDER =
  import.meta.env.VITE_CLOUDINARY_FOLDER || "campus_marketplace";

export default function Stores({ token: tokenProp, users: usersProp = [], onLoadUsers }) {
  const { token: contextToken } = useAuth();
  const token = tokenProp || contextToken;
  const [localUsers, setLocalUsers] = useState([]);
  const users = usersProp.length > 0 ? usersProp : localUsers;
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editingStoreId, setEditingStoreId] = useState(null);
  const [storeForm, setStoreForm] = useState({ storeName: "", description: "", imageUrl: "" });
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [editUploading, setEditUploading] = useState(false);
  const [editUploadError, setEditUploadError] = useState("");

  const [showStoreForm, setShowStoreForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState({ storeName: "", description: "", ownerId: "", imageUrl: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

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
    setCreateForm({ storeName: "", description: "", ownerId: "", imageUrl: "" });
    setCreateError("");
    setImageFile(null);
    setImagePreview("");
    setUploadError("");
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCreateError("");
    setUploadError("");

    if (!file.type.startsWith("image/")) {
      setCreateError("Please choose an image file.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setCreateError(`Max file size is ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUploadImage = async () => {
    setCreateError("");
    setUploadError("");

    if (!imageFile) return;

    if (!CLOUDINARY_UPLOAD_PRESET) {
      setUploadError("Cloudinary preset missing.");
      return;
    }

    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", imageFile);
      fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      fd.append("folder", CLOUDINARY_FOLDER);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        fd
      );

      setCreateForm((prev) => ({
        ...prev,
        imageUrl: res.data.secure_url,
      }));
    } catch {
      setUploadError("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError("");
    if (!createForm.storeName.trim()) { setCreateError("Store name is required."); return; }
    if (imageFile && !createForm.imageUrl) { setCreateError("Upload image first."); return; }

    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/admin/stores`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          storeName: createForm.storeName.trim(),
          description: createForm.description.trim() || null,
          imageUrl: createForm.imageUrl || null,
          ownerId: createForm.ownerId ? Number(createForm.ownerId) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setCreateError(data.error || "Failed to create store."); return; }
      setStores((prev) => [data, ...prev]);
      setShowStoreForm(false);
      resetCreateForm();
    } catch {
      setCreateError("Failed to create store.");
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
    setStoreForm({
      storeName: store.storeName || "",
      description: store.description || "",
      imageUrl: store.imageUrl || "",
    });
    setEditImageFile(null);
    setEditImagePreview(store.imageUrl || "");
    setEditUploadError("");
  };

  const stopEdit = () => {
    setEditingStoreId(null);
    setEditImageFile(null);
    setEditImagePreview("");
    setEditUploadError("");
  };

  const handleEditImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditUploadError("");

    if (!file.type.startsWith("image/")) {
      setEditUploadError("Please choose an image file.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setEditUploadError(`Max file size is ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  const handleEditUploadImage = async () => {
    setEditUploadError("");

    if (!editImageFile) return;

    if (!CLOUDINARY_UPLOAD_PRESET) {
      setEditUploadError("Cloudinary preset missing.");
      return;
    }

    setEditUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", editImageFile);
      fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      fd.append("folder", CLOUDINARY_FOLDER);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        fd
      );

      setStoreForm((prev) => ({
        ...prev,
        imageUrl: res.data.secure_url,
      }));
    } catch {
      setEditUploadError("Image upload failed.");
    } finally {
      setEditUploading(false);
    }
  };

  const saveStore = async (storeId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/stores/${storeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          storeName: storeForm.storeName,
          description: storeForm.description,
          imageUrl: storeForm.imageUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to update store."); return; }
      setStores((prev) => prev.map((s) => (s.id === storeId ? data : s)));
      stopEdit();
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
                <label htmlFor="store-owner" className="admin-form-label">Owner (optional)</label>
                <select
                  id="store-owner"
                  className="admin-form-select"
                  value={createForm.ownerId}
                  onChange={(e) => setCreateForm((p) => ({ ...p, ownerId: e.target.value }))}
                >
                  <option value="">Assign later</option>
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
              <div className="admin-form-field">
                <label className="admin-form-label">Store Image</label>
                <input type="file" accept="image/*" onChange={handleImageSelect} />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: 140,
                      height: 140,
                      objectFit: "cover",
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                      marginTop: 10,
                    }}
                  />
                )}
                <button
                  type="button"
                  className="btn-secondary"
                  
                  onClick={handleUploadImage}
                  disabled={!imageFile || uploading}
                  style={{  width: "fit-content",
                    background: "#800020",
                    color: "white",
                    border: "none", }}
                >
                  {uploading ? "Uploading..." : "Upload to Cloudinary"}
                </button>
                {uploadError && (
                  <div style={{ fontSize: 12, color: "#b91c1c", marginTop: 6 }}>
                    {uploadError}
                  </div>
                )}
              </div>
              {createError && <div className="admin-error" style={{ borderRadius: 8 }}>{createError}</div>}
              <div className="admin-form-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowStoreForm(false); resetCreateForm(); }}
                   style={{
                    background: "white",
                    color: "black",
                    border: "1px solid black",
                    boxShadow: "none",
                  }}>
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
                {["Store", "Owner", "Created By", "Application", "Status", "Created", "Actions"].map((h) => (
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
                          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
                            <input type="file" accept="image/*" onChange={handleEditImageSelect} />
                            {editImagePreview && (
                              <img
                                src={editImagePreview}
                                alt="Preview"
                                style={{
                                  width: 90,
                                  height: 90,
                                  objectFit: "cover",
                                  borderRadius: 8,
                                  border: "1px solid #e5e7eb",
                                }}
                              />
                            )}
                            <button
                              type="button"
                              className="btn-sm-primary"
                              onClick={handleEditUploadImage}
                              disabled={!editImageFile || editUploading}
                              style={{ width: "fit-content" }}
                            >
                              {editUploading ? "Uploading..." : "Upload Image"}
                            </button>
                            {editUploadError && (
                              <div style={{ fontSize: 12, color: "#b91c1c" }}>
                                {editUploadError}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {store.imageUrl && (
                            <img
                              src={store.imageUrl}
                              alt={store.storeName}
                              style={{ width: 46, height: 46, borderRadius: 8, objectFit: "cover", border: "1px solid #f0e8e8" }}
                            />
                          )}
                          <div>{store.storeName}</div>
                        </div>
                      )}
                    </td>
                    <td>{store.ownerUsername || store.ownerEmail || "Unassigned"}</td>
                    <td>{store.createdByUsername || store.createdByEmail || "—"}</td>
                    <td>{store.applicationStatus || "—"}</td>
                    <td><StatusBadge status={statusLabel} /></td>
                    <td>{store.createdAt ? new Date(store.createdAt).toLocaleDateString() : "—"}</td>
                    <td>
                      {editingStoreId === store.id ? (
                        <div className="admin-action-group">
                          <button className="btn-sm-primary" onClick={() => saveStore(store.id)}>Save</button>
                          <button className="btn-sm-secondary" onClick={stopEdit}>Cancel</button>
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