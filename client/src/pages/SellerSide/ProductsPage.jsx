import { useEffect, useState } from "react";
import axios from "axios";
import { PageHeader, Card, StatusBadge } from "../../components/Shared";
import { useAuth } from "../../AuthContext";

const API_BASE = "http://localhost:8080/api";
const MAX_IMAGE_SIZE_MB = 30;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dlljmtv5g";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";
const CLOUDINARY_FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER || "campus_marketplace";
const CATEGORY_OPTIONS = [
  "Food and Beverages",
  "Stickers and Pins",
  "CIT-U Official Items",
  "Other",
];

export default function ProductsPage() {
  const { token } = useAuth();
  const TABS = ["All Products", "Active", "Draft", "Out of Stock"];
  const [activeTab, setActiveTab] = useState("All Products");
  const [selected, setSelected] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    imageUrl: "",
    category: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_BASE}/seller/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch {
        setError("Cannot reach server.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadProducts();
    }
  }, [token]);

  const normalizeStatus = (status) => (status || "").toLowerCase();
  const getStatus = (product) => {
    if (product.status) return product.status;
    if (product.stockQuantity === 0) return "Out of Stock";
    return "Active";
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError("");
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", stockQuantity: "", imageUrl: "", category: "" });
    setImageFile(null);
    setImagePreview("");
    setFormError("");
  };

  const handleImageSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setImageFile(null);
      setImagePreview("");
      setForm((prev) => ({ ...prev, imageUrl: "" }));
      return;
    }
    if (!file.type.startsWith("image/")) {
      setFormError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setFormError(`Max file size is ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormError("");
  };

  const handleUploadImage = async () => {
    if (!imageFile) {
      setFormError("Please select an image first.");
      return;
    }
    if (!CLOUDINARY_UPLOAD_PRESET) {
      setFormError("Cloudinary upload preset is missing.");
      return;
    }
    setUploading(true);
    setFormError("");

    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      if (CLOUDINARY_FOLDER) {
        formData.append("folder", CLOUDINARY_FOLDER);
      }

      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );

      const secureUrl = uploadRes.data?.secure_url || "";
      setForm((prev) => ({ ...prev, imageUrl: secureUrl }));
    } catch {
      setFormError("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Product name is required.");
      return;
    }
    if (form.price === "" || Number.isNaN(Number(form.price))) {
      setFormError("Price is required.");
      return;
    }
    if (form.stockQuantity === "" || Number.isNaN(Number(form.stockQuantity))) {
      setFormError("Stock quantity is required.");
      return;
    }
    if (!form.imageUrl) {
      setFormError("Please upload an image first.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        imageUrl: form.imageUrl.trim() || null,
        category: form.category || null,
      };
      const res = await axios.post(`${API_BASE}/seller/products`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts((prev) => [res.data, ...prev]);
      setShowForm(false);
      resetForm();
    } catch (err) {
      const message = err?.response?.data?.error || "Failed to add product.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };
  
  const filtered = products.filter((p) => {
    const status = normalizeStatus(getStatus(p));
    if (activeTab === "All Products") return true;
    if (activeTab === "Active") return status === "active";
    if (activeTab === "Draft") return status === "draft";
    if (activeTab === "Out of Stock") return status === "out of stock" || p.stockQuantity === 0;
    return true;
  });
  
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map((p) => p.id));
  const toggleRow = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px" }}>
      <PageHeader
        title="Products"
        subtitle="Manage your store's inventory, pricing, and availability."
        actions={
          <>
            <button className="cm-btn-ghost">⬇ Export</button>
            <button className="cm-btn-primary" onClick={() => setShowForm(true)}>+ Add Product</button>
          </>
        }
      />
      {showForm && (
        <Card style={{ marginBottom: 16 }}>
          <form onSubmit={handleSubmit} style={{ padding: "16px 20px", display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="name" style={{ fontWeight: 600 }}>Name</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Product name"
                style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
              />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="description" style={{ fontWeight: 600 }}>Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                rows={3}
                placeholder="Short description"
                style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
              />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="price" style={{ fontWeight: 600 }}>Price</label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={handleFormChange}
                placeholder="0.00"
                style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
              />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="stockQuantity" style={{ fontWeight: 600 }}>Stock Quantity</label>
              <input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                value={form.stockQuantity}
                onChange={handleFormChange}
                placeholder="0"
                style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
              />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="category" style={{ fontWeight: 600 }}>Category</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleFormChange}
                style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
              >
                <option value="">Select a category</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <label htmlFor="imageFile" style={{ fontWeight: 600 }}>Image</label>
              <input
                id="imageFile"
                name="imageFile"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
              )}
              <button
                type="button"
                className="cm-btn-ghost"
                onClick={handleUploadImage}
                disabled={!imageFile || uploading}
              >
                {uploading ? "Uploading..." : form.imageUrl ? "Re-upload Image" : "Upload Image"}
              </button>
              {form.imageUrl && (
                <div style={{ fontSize: 12, color: "#6b7280" }}>Image uploaded.</div>
              )}
            </div>
            {formError && (
              <div style={{ color: "#b91c1c", background: "#fef2f2", padding: "8px 12px", borderRadius: 8 }}>
                {formError}
              </div>
            )}
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="cm-btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : "Save Product"}
              </button>
              <button type="button" className="cm-btn-ghost" onClick={() => { resetForm(); setShowForm(false); }}>
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}
      {error && (
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px 16px", borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #f5f0f0" }}>
          <div style={{ display: "flex", gap: 4 }}>
            {TABS.map(tab => (
              <button key={tab} className="cm-tab" onClick={() => setActiveTab(tab)} style={{
                border: activeTab === tab ? "1.5px solid #d8b8b8" : "1.5px solid transparent",
                background: activeTab === tab ? "#fff" : "transparent",
                color: activeTab === tab ? "#8b0000" : "#888",
                fontWeight: activeTab === tab ? 600 : 400,
              }}>{tab}</button>
            ))}
          </div>
          <button className="cm-btn-ghost" style={{ padding: "6px 14px", fontSize: 13 }}>⚙ More Filters</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f5f0f0" }}>
              <th style={{ padding: "11px 20px", width: 40 }}>
                <input type="checkbox" className="cm-checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} />
              </th>
              {["Product", "SKU", "Price", "Stock", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "11px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#aaa", letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} style={{ padding: "18px 20px", color: "#9ca3af" }}>
                  Loading products...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "18px 20px", color: "#9ca3af" }}>
                  No Products Found
                </td>
              </tr>
            )}
            {!loading && filtered.map((p, i) => (
              <tr key={p.id || `row-${i}`} className="cm-row" style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f8f2f2" : "none", background: selected.includes(p.id) ? "#fdf8f8" : "#fff" }}>
                <td style={{ padding: "14px 20px" }}><input type="checkbox" className="cm-checkbox" checked={selected.includes(p.id)} onChange={() => toggleRow(p.id)} /></td>
                <td style={{ padding: "14px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {p.imageUrl && (
                      <img src={p.imageUrl} alt={p.name} style={{ width: 46, height: 46, borderRadius: 8, objectFit: "cover", border: "1px solid #f0e8e8" }} />
                    )}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#222" }}>{p.name || "Untitled"}</div>
                      <div style={{ fontSize: 12, color: "#bbb", marginTop: 2 }}>{p.category || "Uncategorized"}</div>
                      {p.description && (
                        <div style={{ fontSize: 11, color: "#c1c1c1", marginTop: 2 }}>{p.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 12px", fontSize: 13, color: "#aaa", fontWeight: 500 }}>{p.id || "—"}</td>
                <td style={{ padding: "14px 12px", fontSize: 14, fontWeight: 600, color: "#333" }}>${Number(p.price || 0).toLocaleString()}.00</td>
                <td style={{ padding: "14px 12px" }}>
                  {p.stockQuantity === null || p.stockQuantity === undefined ? <span style={{ color: "#ccc" }}>—</span>
                    : p.stockQuantity === 0 ? <span style={{ fontSize: 13, color: "#ef4444", fontWeight: 600 }}>0 in stock</span>
                    : <div><div style={{ fontSize: 13, color: "#333", fontWeight: 500 }}>{p.stockQuantity} in stock</div></div>}
                </td>
                <td style={{ padding: "14px 12px" }}><StatusBadge status={getStatus(p)} /></td>
                <td style={{ padding: "14px 12px" }}>
                  <button style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 10px", borderRadius: 6, color: "#aaa", fontSize: 18, letterSpacing: 1 }}>···</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid #f5f0f0" }}>
          <span style={{ fontSize: 13, color: "#bbb" }}>Showing 1 to {filtered.length} of {products.length} products</span>
          <div style={{ display: "flex", gap: 4 }}>
            {["‹", "1", "2", "3", "›"].map((p, i) => (
              <button key={i} className={`cm-pg-btn${p === "1" ? " active" : ""}`}>{p}</button>
            ))}
          </div>
        </div>
      </Card>
    </main>
  );
}