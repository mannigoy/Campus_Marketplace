import { useEffect, useState } from "react";
import axios from "axios";
import { PageHeader, Card, StatusBadge } from "../../components/Shared";
import { useAuth } from "../../AuthContext";
import AddProduct from "../AddProduct";

const API_BASE = "http://localhost:8080/api";
export default function ProductsPage() {
  const { token } = useAuth();
  const TABS = ["All Products", "Active", "Draft", "Out of Stock"];
  const [activeTab, setActiveTab] = useState("All Products");
  const [selected, setSelected] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    imageUrl: "",
    category: "",
  });
  const [editError, setEditError] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

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
  const formatStatusLabel = (rawStatus) => {
    if (!rawStatus) return "";
    const normalized = String(rawStatus).toLowerCase();
    if (normalized === "active") return "Active";
    if (normalized === "hidden") return "Hidden";
    if (normalized === "suspended") return "Suspended";
    if (normalized === "inactive") return "Inactive";
    return rawStatus;
  };
  const getStatus = (product) => {
    const statusLabel = formatStatusLabel(product.status);
    if (statusLabel === "Hidden") return "Hidden";
    if (product.stockQuantity === 0) return "Out of Stock";
    if (statusLabel) return statusLabel;
    return "Active";
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      stockQuantity: product.stockQuantity ?? "",
      imageUrl: product.imageUrl || "",
      category: product.category || "",
    });
    setEditError("");
  };

  const closeEditProduct = () => {
    setEditingProduct(null);
    setEditError("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError("");

    if (!editForm.name.trim()) {
      setEditError("Product name is required.");
      return;
    }
    if (editForm.price === "" || Number.isNaN(Number(editForm.price))) {
      setEditError("Price is required.");
      return;
    }
    if (editForm.stockQuantity === "" || Number.isNaN(Number(editForm.stockQuantity))) {
      setEditError("Stock quantity is required.");
      return;
    }

    setEditSubmitting(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        price: Number(editForm.price),
        stockQuantity: Number(editForm.stockQuantity),
        imageUrl: editForm.imageUrl.trim() || null,
        category: editForm.category || null,
      };
      const res = await axios.put(`${API_BASE}/seller/products/${editingProduct.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? res.data : p)));
      closeEditProduct();
    } catch (err) {
      const message = err?.response?.data?.error || "Failed to update product.";
      setEditError(message);
    } finally {
      setEditSubmitting(false);
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
           
            <button className="cm-btn-primary" onClick={() => setShowForm(true)}>+ Add Product</button>
          </>
        }
      />
      {editingProduct && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 40, padding: 20 }}>
          <Card style={{ width: 560, maxWidth: "95vw" }}>
            <form onSubmit={handleEditSubmit} style={{ padding: "16px 20px", display: "grid", gap: 12 }}>
              <div style={{ fontWeight: 600, color: "#111827", fontSize: 16 }}>Edit Product</div>
              <div style={{ display: "grid", gap: 6 }}>
                <label htmlFor="edit-name" style={{ fontWeight: 600 }}>Name</label>
                <input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
                />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label htmlFor="edit-description" style={{ fontWeight: 600 }}>Description</label>
                <textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <label htmlFor="edit-price" style={{ fontWeight: 600 }}>Price</label>
                  <input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
                    style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
                  />
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  <label htmlFor="edit-stock" style={{ fontWeight: 600 }}>Stock Quantity</label>
                  <input
                    id="edit-stock"
                    type="number"
                    value={editForm.stockQuantity}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, stockQuantity: e.target.value }))}
                    style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label htmlFor="edit-category" style={{ fontWeight: 600 }}>Category</label>
                <input
                  id="edit-category"
                  value={editForm.category}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                  style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
                />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label htmlFor="edit-image" style={{ fontWeight: 600 }}>Image URL</label>
                <input
                  id="edit-image"
                  value={editForm.imageUrl}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
                />
              </div>
              {editError && (
                <div style={{ color: "#b91c1c", background: "#fef2f2", padding: "8px 12px", borderRadius: 8 }}>
                  {editError}
                </div>
              )}
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="cm-btn-ghost"
                  onClick={closeEditProduct}
                >
                  Cancel
                </button>
                <button type="submit" className="cm-btn-primary" disabled={editSubmitting}>
                  {editSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
      {showForm && (
       <AddProduct
    onSuccess={(newProduct) => {
      setProducts((prev) => [newProduct, ...prev]);
      setShowForm(false);
    }}
    onCancel={() => setShowForm(false)}
  />
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
                <td style={{ padding: "14px 12px", fontSize: 14, fontWeight: 600, color: "#333" }}>₱{Number(p.price || 0).toLocaleString()}.00</td>
                <td style={{ padding: "14px 12px" }}>
                  {p.stockQuantity === null || p.stockQuantity === undefined ? <span style={{ color: "#ccc" }}>—</span>
                    : p.stockQuantity === 0 ? <span style={{ fontSize: 13, color: "#ef4444", fontWeight: 600 }}>0 in stock</span>
                    : <div><div style={{ fontSize: 13, color: "#333", fontWeight: 500 }}>{p.stockQuantity} in stock</div></div>}
                </td>
                <td style={{ padding: "14px 12px" }}><StatusBadge status={getStatus(p)} /></td>
                <td style={{ padding: "14px 12px" }}>
                  <button
                    onClick={() => openEditProduct(p)}
                    style={{ background: "#111827", color: "white", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}
                  >
                    Edit Product
                  </button>
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