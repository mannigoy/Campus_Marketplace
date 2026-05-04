import React, { useEffect, useMemo, useState } from "react";
import { Card, PageHeader } from "../../components/Shared";
import { useAuth } from "../../AuthContext";

const API_BASE = "http://localhost:8080/api";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("applications");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storesError, setStoresError] = useState("");
  const [editingStoreId, setEditingStoreId] = useState(null);
  const [storeForm, setStoreForm] = useState({ storeName: "", description: "" });

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    imageUrl: "",
    category: "",
  });
  const [storeFilter, setStoreFilter] = useState("All Stores");

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

  useEffect(() => {
    if (!token) return;
    if (activeTab === "users" && users.length === 0 && !usersLoading) {
      loadUsers();
    }
    if (activeTab === "stores" && stores.length === 0 && !storesLoading) {
      loadStores();
    }
    if (activeTab === "products" && products.length === 0 && !productsLoading) {
      loadProducts();
    }
  }, [activeTab, token]);

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

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setUsersError(data.error || "Failed to load users.");
        setUsers([]);
        return;
      }
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsersError("Cannot reach server.");
    } finally {
      setUsersLoading(false);
    }
  };

  const loadStores = async () => {
    setStoresLoading(true);
    setStoresError("");
    try {
      const res = await fetch(`${API_BASE}/admin/stores`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setStoresError(data.error || "Failed to load stores.");
        setStores([]);
        return;
      }
      setStores(Array.isArray(data) ? data : []);
    } catch {
      setStoresError("Cannot reach server.");
    } finally {
      setStoresLoading(false);
    }
  };

  const loadProducts = async () => {
    setProductsLoading(true);
    setProductsError("");
    try {
      const res = await fetch(`${API_BASE}/admin/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setProductsError(data.error || "Failed to load products.");
        setProducts([]);
        return;
      }
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProductsError("Cannot reach server.");
    } finally {
      setProductsLoading(false);
    }
  };

  const startEditStore = (store) => {
    setEditingStoreId(store.id);
    setStoreForm({ storeName: store.storeName || "", description: store.description || "" });
  };

  const saveStore = async (storeId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/stores/${storeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storeName: storeForm.storeName,
          description: storeForm.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStoresError(data.error || "Failed to update store.");
        return;
      }
      setStores((prev) => prev.map((store) => (store.id === storeId ? data : store)));
      setEditingStoreId(null);
    } catch {
      setStoresError("Cannot reach server.");
    }
  };

  const startEditProduct = (product) => {
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
      if (!res.ok) {
        setProductsError(data.error || "Failed to update product.");
        return;
      }
      setProducts((prev) => prev.map((product) => (product.id === productId ? data : product)));
      setEditingProductId(null);
    } catch {
      setProductsError("Cannot reach server.");
    }
  };

  const storeOptions = useMemo(() => {
    const names = new Set();
    products.forEach((product) => {
      if (product.storeName) {
        names.add(product.storeName);
      }
    });
    return ["All Stores", ...Array.from(names)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (storeFilter === "All Stores") return products;
    return products.filter((product) => product.storeName === storeFilter);
  }, [products, storeFilter]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px" }}>
      <PageHeader title="Admin Dashboard" subtitle="Manage applications, users, stores, and products." />

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { key: "applications", label: "Pending Applications" },
          { key: "users", label: "Users" },
          { key: "stores", label: "Stores" },
          { key: "products", label: "Products" },
        ].map((tab) => (
          <button
            key={tab.key}
            className="cm-tab"
            onClick={() => setActiveTab(tab.key)}
            style={{
              border: activeTab === tab.key ? "1.5px solid #d8b8b8" : "1.5px solid transparent",
              background: activeTab === tab.key ? "#fff" : "transparent",
              color: activeTab === tab.key ? "#8b0000" : "#888",
              fontWeight: activeTab === tab.key ? 600 : 400,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "applications" && (
        <Card>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f5f0f0" }}>
            <div style={{ fontWeight: 600, color: "#222" }}>Pending Seller Applications</div>
          </div>
          {error && (
            <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px 16px" }}>
              {error}
            </div>
          )}
          {loading ? (
            <div style={{ padding: "16px 20px" }}>Loading applications...</div>
          ) : applications.length === 0 ? (
            <div style={{ padding: "16px 20px" }}>No pending applications.</div>
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
        </Card>
      )}

      {activeTab === "users" && (
        <Card>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f5f0f0" }}>
            <div style={{ fontWeight: 600, color: "#222" }}>All Users</div>
          </div>
          {usersError && (
            <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px 16px" }}>{usersError}</div>
          )}
          {usersLoading ? (
            <div style={{ padding: "16px 20px" }}>Loading users...</div>
          ) : users.length === 0 ? (
            <div style={{ padding: "16px 20px" }}>No users found.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f5f0f0" }}>
                  {"ID,Username,Email,Role,Store".split(",").map((header) => (
                    <th key={header} style={{ padding: "11px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#aaa", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid #f8f2f2" }}>
                    <td style={{ padding: "12px" }}>{user.id}</td>
                    <td style={{ padding: "12px" }}>{user.username || "—"}</td>
                    <td style={{ padding: "12px" }}>{user.email}</td>
                    <td style={{ padding: "12px" }}>{user.role}</td>
                    <td style={{ padding: "12px" }}>{user.storeName || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {activeTab === "stores" && (
        <Card>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f5f0f0" }}>
            <div style={{ fontWeight: 600, color: "#222" }}>Approved Stores</div>
          </div>
          {storesError && (
            <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px 16px" }}>{storesError}</div>
          )}
          {storesLoading ? (
            <div style={{ padding: "16px 20px" }}>Loading stores...</div>
          ) : stores.length === 0 ? (
            <div style={{ padding: "16px 20px" }}>No stores found.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f5f0f0" }}>
                  {"Store,Owner,Verified,Created,Actions".split(",").map((header) => (
                    <th key={header} style={{ padding: "11px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#aaa", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id} style={{ borderBottom: "1px solid #f8f2f2" }}>
                    <td style={{ padding: "12px" }}>
                      {editingStoreId === store.id ? (
                        <input
                          value={storeForm.storeName}
                          onChange={(e) => setStoreForm((prev) => ({ ...prev, storeName: e.target.value }))}
                          style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #e5e7eb", width: "100%" }}
                        />
                      ) : (
                        store.storeName
                      )}
                      {editingStoreId === store.id && (
                        <textarea
                          value={storeForm.description}
                          onChange={(e) => setStoreForm((prev) => ({ ...prev, description: e.target.value }))}
                          rows={2}
                          placeholder="Store description"
                          style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #e5e7eb", marginTop: 6, width: "100%" }}
                        />
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>{store.ownerUsername || store.ownerEmail || "—"}</td>
                    <td style={{ padding: "12px" }}>{store.applicationStatus || "—"}</td>
                    <td style={{ padding: "12px" }}>{store.createdAt ? new Date(store.createdAt).toLocaleDateString() : "—"}</td>
                    <td style={{ padding: "12px" }}>
                      {editingStoreId === store.id ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => saveStore(store.id)}
                            style={{ background: "#111827", color: "white", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingStoreId(null)}
                            style={{ background: "transparent", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditStore(store)}
                          style={{ background: "#111827", color: "white", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}
                        >
                          Edit Store
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {activeTab === "products" && (
        <Card>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f5f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 600, color: "#222" }}>All Products</div>
            <select
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e5e7eb" }}
            >
              {storeOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          {productsError && (
            <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px 16px" }}>{productsError}</div>
          )}
          {productsLoading ? (
            <div style={{ padding: "16px 20px" }}>Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ padding: "16px 20px" }}>No products found.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f5f0f0" }}>
                  {"Product,Store,Price,Stock,Actions".split(",").map((header) => (
                    <th key={header} style={{ padding: "11px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#aaa", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} style={{ borderBottom: "1px solid #f8f2f2" }}>
                    <td style={{ padding: "12px" }}>
                      {editingProductId === product.id ? (
                        <div style={{ display: "grid", gap: 6 }}>
                          <input
                            value={productForm.name}
                            onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                            style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #e5e7eb" }}
                          />
                          <textarea
                            value={productForm.description}
                            onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                            rows={2}
                            style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #e5e7eb" }}
                          />
                          <input
                            value={productForm.category}
                            onChange={(e) => setProductForm((prev) => ({ ...prev, category: e.target.value }))}
                            placeholder="Category"
                            style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #e5e7eb" }}
                          />
                          <input
                            value={productForm.imageUrl}
                            onChange={(e) => setProductForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                            placeholder="Image URL"
                            style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #e5e7eb" }}
                          />
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontWeight: 600 }}>{product.name}</div>
                          <div style={{ fontSize: 12, color: "#999" }}>{product.category || "—"}</div>
                          <div style={{ fontSize: 12, color: "#999" }}>{product.description || ""}</div>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>{product.storeName || "—"}</td>
                    <td style={{ padding: "12px" }}>
                      {editingProductId === product.id ? (
                        <input
                          type="number"
                          value={productForm.price}
                          onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                          style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #e5e7eb" }}
                        />
                      ) : (
                        `$${Number(product.price || 0).toLocaleString()}`
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {editingProductId === product.id ? (
                        <input
                          type="number"
                          value={productForm.stockQuantity}
                          onChange={(e) => setProductForm((prev) => ({ ...prev, stockQuantity: e.target.value }))}
                          style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #e5e7eb" }}
                        />
                      ) : (
                        product.stockQuantity ?? "—"
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {editingProductId === product.id ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => saveProduct(product.id)}
                            style={{ background: "#111827", color: "white", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingProductId(null)}
                            style={{ background: "transparent", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditProduct(product)}
                          style={{ background: "#111827", color: "white", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}
                        >
                          Edit Product
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
}
