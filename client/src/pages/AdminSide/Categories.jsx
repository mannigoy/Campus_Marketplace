import React, { useEffect, useState } from "react";
import { Card } from "../../components/Shared";
import { useAuth } from "../../AuthContext";
import "../../styles/admin.css";

const API_BASE = "http://localhost:8080/api";

export default function Categories({ token: tokenProp }) {
  const { token: contextToken } = useAuth();
  const token = tokenProp || contextToken;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);

  const loadCategories = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load categories.");
        setCategories([]);
        return;
      }
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setError("Cannot reach server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadCategories();
  }, [token]);

  const resetForm = () => {
    setForm({ name: "", description: "" });
    setFormError("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Category name is required.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/admin/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create category.");
        return;
      }
      setCategories((prev) => [data, ...prev]);
      setShowForm(false);
      resetForm();
    } catch {
      setFormError("Cannot reach server.");
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleDateString();
  };

  return (
    <>
      {showForm && (
        <div className="admin-modal-overlay">
          <Card style={{ width: 520, maxWidth: "95vw" }}>
            <form onSubmit={handleCreate} className="admin-modal-form">
              <div className="admin-modal-title">Add Category</div>
              <div className="admin-form-field">
                <label htmlFor="category-name" className="admin-form-label">Category Name</label>
                <input
                  id="category-name"
                  className="admin-form-input"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Food and Beverages"
                />
              </div>
              <div className="admin-form-field">
                <label htmlFor="category-description" className="admin-form-label">Short Label</label>
                <input
                  id="category-description"
                  className="admin-form-input"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Shop Food"
                />
              </div>
              {formError && <div className="admin-error" style={{ borderRadius: 8 }}>{formError}</div>}
              <div className="admin-form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  style={{
                    background: "white",
                    color: "black",
                    border: "1px solid black",
                    boxShadow: "none",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={creating}
                  style={{ background: "#800020", color: "white" }}
                >
                  {creating ? "Saving..." : "Create Category"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <Card>
        <div className="admin-card-header">
          <div className="admin-card-header-title">Categories</div>
          <button className="btn-primary" onClick={() => { setShowForm(true); setFormError(""); }}>
            + Add Category
          </button>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {loading ? (
          <div className="admin-loading">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="admin-empty">No categories found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                {['Category', 'Created'].map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id || category.name}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {category.imageUrl && (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover", border: "1px solid #f0e8e8" }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#222" }}>{category.name}</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{category.description || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td>{formatDate(category.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
