import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import { PageHeader, Card } from "../../components/Shared";

const API_BASE = "http://localhost:8080/api";

const DEFAULT_ANALYTICS = {
  revenueThisMonth: 0,
  revenueLastMonth: 0,
  ordersThisMonth: 0,
  ordersLastMonth: 0,
  avgOrderValue: 0,
  monthlyRevenue: [],
  topProducts: [],
};

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(DEFAULT_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/seller/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load analytics.");
          return;
        }
        setAnalytics({ ...DEFAULT_ANALYTICS, ...data });
      } catch {
        setError("Cannot reach server.");
      } finally {
        setLoading(false);
      }
    };

    if (token) loadAnalytics();
  }, [token]);

  const {
    revenueThisMonth, revenueLastMonth,
    ordersThisMonth, ordersLastMonth,
    avgOrderValue, monthlyRevenue, topProducts,
  } = analytics;

  const revenueChange = revenueLastMonth
    ? (((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(0)
    : null;
  const orderChange = ordersThisMonth - ordersLastMonth;
  const maxBarVal = monthlyRevenue.length ? Math.max(...monthlyRevenue.map(b => b.value)) : 1;

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px" }}>
      <PageHeader title="Analytics" subtitle="Track your store's performance over time." />

      {error && (
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px 16px", borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          {
            label: "Revenue This Month",
            value: loading ? "—" : `$${revenueThisMonth.toLocaleString()}`,
            sub: loading ? "" : revenueChange !== null ? `${revenueChange >= 0 ? "+" : ""}${revenueChange}% vs last month` : "No prior data",
            positive: revenueChange >= 0,
          },
          {
            label: "Orders This Month",
            value: loading ? "—" : ordersThisMonth.toLocaleString(),
            sub: loading ? "" : `${orderChange >= 0 ? "+" : ""}${orderChange} vs last month`,
            positive: orderChange >= 0,
          },
          {
            label: "Avg. Order Value",
            value: loading ? "—" : `$${Number(avgOrderValue).toLocaleString()}`,
            sub: loading ? "" : `Based on ${ordersThisMonth} orders`,
            positive: true,
          },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 12, color: "#aaa", fontWeight: 500, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: s.positive ? "#10b981" : "#ef4444", fontWeight: 500 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card style={{ padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#222", marginBottom: 20 }}>Monthly Revenue</div>
          {loading ? (
            <div style={{ color: "#9ca3af", fontSize: 13 }}>Loading chart...</div>
          ) : monthlyRevenue.length === 0 ? (
            <div style={{ color: "#9ca3af", fontSize: 13 }}>No revenue data available.</div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 160 }}>
              {monthlyRevenue.map((b, i) => {
                const isMax = b.value === maxBarVal;
                const heightPx = maxBarVal > 0 ? (b.value / maxBarVal) * 144 : 0;
                return (
                  <div key={b.month ?? i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: "100%", background: isMax ? "#8b0000" : "#f5e0e0", borderRadius: "4px 4px 0 0", height: `${heightPx}px`, transition: "height 0.3s" }} />
                    <span style={{ fontSize: 11, color: "#bbb", fontWeight: 500 }}>{b.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card style={{ padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#222", marginBottom: 16 }}>Top Products</div>
          {loading ? (
            <div style={{ color: "#9ca3af", fontSize: 13 }}>Loading products...</div>
          ) : topProducts.length === 0 ? (
            <div style={{ color: "#9ca3af", fontSize: 13 }}>No product data available.</div>
          ) : (
            topProducts.map((p, i) => (
              <div key={p.id ?? p.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < topProducts.length - 1 ? "1px solid #f5f0f0" : "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "#fdf0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#8b0000" }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#bbb", marginTop: 2 }}>{p.units} units sold</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>${Number(p.revenue).toLocaleString()}</div>
              </div>
            ))
          )}
        </Card>
      </div>
    </main>
  );
}