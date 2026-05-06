import React, { useEffect, useMemo, useState } from "react";
import { Card, StatusBadge } from "../../components/Shared";
import { useAuth } from "../../AuthContext";
import AddProduct from "../AddProduct";
import "../../styles/admin.css";

const API_BASE = "http://localhost:8080/api";

export default function Products({ token: tokenProp, stores: storesProp = [], onLoadStores }) {
  const { token: contextToken } = useAuth();
  const token = tokenProp || contextToken;
  const [localStores, setLocalStores] = useState([]);
  const availableStores = storesProp.length > 0 ? storesProp : localStores;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "", description: "", price: "", stockQuantity: "", imageUrl: "", category: "",
  });

  const [showProductForm, setShowProductForm] = useState(false);

  const [storeFilter, setStoreFilter] = useState("All Stores");

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to load products."); setProducts([]); return; }
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setError("Cannot reach server.");
    } finally {
      setLoading(false);
    }
  };

  const loadStores = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/admin/stores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load stores.");
        setLocalStores([]);
        return;
      }
      setLocalStores(Array.isArray(data) ? data : []);
    } catch {
      setError("Cannot reach server.");
      setLocalStores([]);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadProducts();
    if (storesProp.length === 0) {
      if (onLoadStores) {
        onLoadStores();
      } else {
        loadStores();
      }
    }
  }, [token, onLoadStores, storesProp.length]);

  const getProductStatus = (product) => {
    const raw = product.status;
    if (!raw) return "Active";
    const n = String(raw).toLowerCase();
    if (n === "active") return "Active";
    if (n === "hidden") return "Hidden";
    if (n === "inactive") return "Inactive";
    return raw;
  };

  const toggleStatus = async (product) => {
    const current = String(product.status || "ACTIVE").toUpperCase();
    const next = current === "HIDDEN" ? "ACTIVE" : "HIDDEN";
    try {
      const res = await fetch(`${API_BASE}/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to update product status."); return; }
      setProducts((prev) => prev.map((p) => (p.id === product.id ? data : p)));
    } catch {
      setError("Cannot reach server.");
    }
  };

  const startEdit = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      stockQuantity: product.stockQuantity ?? "",
      imageUrl: product.imageUrl || "",
      category: product.category || "",
    });
  };

  const saveProduct = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description,
          price: productForm.price === "" ? null : Number(productForm.price),
          stockQuantity: productForm.stockQuantity === "" ? null : Number(productForm.stockQuantity),
          imageUrl: productForm.imageUrl,
          category: productForm.category,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to update product."); return; }
      setProducts((prev) => prev.map((p) => (p.id === productId ? data : p)));
      setEditingProductId(null);
    } catch {
      setError("Cannot reach server.");
    }
  };

  const storeOptions = useMemo(() => {
    const names = new Set();
    products.forEach((p) => { if (p.storeName) names.add(p.storeName); });
    return ["All Stores", ...Array.from(names)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (storeFilter === "All Stores") return products;
    return products.filter((p) => p.storeName === storeFilter);
  }, [products, storeFilter]);

  return (
    <>
      {/* Create Product Modal */}
      {showProductForm && (
     
            <AddProduct
              mode="admin"
              stores={availableStores}
              onSuccess={(newProduct) => {
                setProducts((prev) => [newProduct, ...prev]);
                setShowProductForm(false);
              }}
              onCancel={() => setShowProductForm(false)}
            />
          
      )}

      {/* Main Card */}
      <Card>
        <div className="admin-card-header">
          <div className="admin-card-header-title">All Products</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <select
              className="admin-form-select"
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              style={{ padding: "6px 10px" }}
            >
              {storeOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <button className="btn-primary" onClick={() => setShowProductForm(true)}>
              + Add Product
            </button>
          </div>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {loading ? (
          <div className="admin-loading">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="admin-empty">No products found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                {["Product", "Store", "Status", "Price", "Stock", "Actions"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const productStatus = getProductStatus(product);
                const isHidden = productStatus === "Hidden";
                return (
                  <tr key={product.id}>
                   <td>
  {editingProductId === product.id ? (
    <div style={{ display: "grid", gap: 6 }}>
      <input className="admin-inline-input" value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} />
      <textarea className="admin-inline-textarea" rows={2} value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} />
      <input className="admin-inline-input" value={productForm.category} onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))} placeholder="Category" />
      <input className="admin-inline-input" value={productForm.imageUrl} onChange={(e) => setProductForm((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="Image URL" />
    </div>
  ) : (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{ width: 46, height: 46, borderRadius: 8, objectFit: "cover", border: "1px solid #f0e8e8" }}
        />
      )}
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: "#222" }}>{product.name}</div>
        <div style={{ fontSize: 12, color: "#bbb", marginTop: 2 }}>{product.category || "Uncategorized"}</div>
        <div style={{ fontSize: 11, color: "#c1c1c1", marginTop: 2 }}>{product.description || ""}</div>
      </div>
    </div>
  )}
</td>
                    <td>{product.storeName || "—"}</td>
                    <td><StatusBadge status={productStatus} /></td>
                    <td>
                      {editingProductId === product.id ? (
                        <input type="number" className="admin-inline-input" value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} />
                      ) : (
                        `₱${Number(product.price || 0).toLocaleString()}`
                      )}
                    </td>
                    <td>
                      {editingProductId === product.id ? (
                        <input type="number" className="admin-inline-input" value={productForm.stockQuantity} onChange={(e) => setProductForm((p) => ({ ...p, stockQuantity: e.target.value }))} />
                      ) : (
                        product.stockQuantity ?? "—"
                      )}
                    </td>
                    <td>
                      {editingProductId === product.id ? (
                        <div className="admin-action-group">
                          <button className="btn-sm-primary" onClick={() => saveProduct(product.id)}>Save</button>
                          <button className="btn-sm-secondary" onClick={() => setEditingProductId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <div className="admin-action-group">
                          <button className="btn-sm-primary" onClick={() => startEdit(product)}>Edit Product</button>
                          <button
                            className={isHidden ? "btn-sm-primary" : "btn-sm-warning"}
                            onClick={() => toggleStatus(product)}
                          >
                            {isHidden ? "Mark Available" : "Mark Unavailable"}
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