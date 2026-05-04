import { useEffect, useState } from "react";
import { Card, StatusBadge } from "../../components/Shared";
import { useAuth } from "../../AuthContext";

const API_BASE = "http://localhost:8080/api";
const DEFAULT_STATS = {
  totalRevenue: 0,
  orders: 0,
  products: 0,
  customers: 0,
};

export default function DashboardPage({ onNavigate }) {
  const { token } = useAuth();
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/seller/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load dashboard.");
          return;
        }
        setStats(data.stats || DEFAULT_STATS);
        setRecentOrders(data.recentOrders || []);
        setLowStockProducts(data.lowStockProducts || []);
        setStoreName(data.storeName || "");
      } catch {
        setError("Cannot reach server.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadDashboard();
    }
  }, [token]);

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#222" }}>
          {storeName || "Seller Dashboard"}
        </div>
        <div style={{ fontSize: 13, color: "#9ca3af" }}>
          Store overview and activity
        </div>
      </div>
      {error && (
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px 16px", borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}` },
          { label: "Orders", value: stats.orders.toLocaleString() },
          { label: "Products", value: stats.products.toLocaleString() },
          { label: "Customers", value: stats.customers.toLocaleString() },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 12, color: "#aaa", fontWeight: 500, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid #f5f0f0" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#222" }}>Recent Orders</div>
          </div>
          {loading && (
            <div style={{ padding: "12px 20px", color: "#9ca3af" }}>Loading orders...</div>
          )}
          {!loading && recentOrders.length === 0 && (
            <div style={{ padding: "12px 20px", color: "#9ca3af" }}>No recent orders.</div>
          )}
          {recentOrders.map((o) => (
            <div key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid #f9f4f4" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{o.customer}</div>
                <div style={{ fontSize: 12, color: "#bbb", marginTop: 2 }}>{o.product}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <StatusBadge status={o.status} />
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>${Number(o.total || 0).toLocaleString()}</div>
              </div>
            </div>
          ))}
          <div style={{ padding: "12px 20px" }}>
            <button className="cm-btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => onNavigate("orders")}>View All Orders</button>
          </div>
        </Card>

        <Card>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid #f5f0f0" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#222" }}>Low Stock Alert</div>
          </div>
          {loading && (
            <div style={{ padding: "12px 20px", color: "#9ca3af" }}>Loading stock...</div>
          )}
          {!loading && lowStockProducts.length === 0 && (
            <div style={{ padding: "12px 20px", color: "#9ca3af" }}>No low stock items.</div>
          )}
          {lowStockProducts.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "1px solid #f9f4f4" }}>
              {p.image && (
                <img src={p.image} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", border: "1px solid #f0e8e8" }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{p.name}</div>
                <div style={{ fontSize: 12, color: p.stock === 0 ? "#ef4444" : "#f97316", fontWeight: 600, marginTop: 2 }}>
                  {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                </div>
              </div>
              <button className="cm-btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => onNavigate("products")}>Restock</button>
            </div>
          ))}
          <div style={{ padding: "12px 20px" }}>
            <button className="cm-btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => onNavigate("products")}>View All Products</button>
          </div>
        </Card>
      </div>
    </main>
  );
}