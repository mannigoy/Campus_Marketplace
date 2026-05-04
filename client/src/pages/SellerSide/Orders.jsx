import { useState } from "react";
import { PageHeader, Card, StatusBadge } from "../../components/Shared";

export default function OrdersPage() {
  const [filter, setFilter] = useState("All");
  const [orders] = useState([]);
  const statuses = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];
  const filtered = filter === "All" ? orders : orders.filter(o => o.status === filter);
  
  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px" }}>
      <PageHeader title="Orders" subtitle="Track and manage your customer orders." actions={<button className="cm-btn-ghost">⬇ Export</button>} />
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", borderBottom: "1px solid #f5f0f0", flexWrap: "wrap" }}>
          {statuses.map(s => (
            <button key={s} className="cm-tab" onClick={() => setFilter(s)} style={{
              border: filter === s ? "1.5px solid #d8b8b8" : "1.5px solid transparent",
              background: filter === s ? "#fff" : "transparent",
              color: filter === s ? "#8b0000" : "#888",
              fontWeight: filter === s ? 600 : 400,
            }}>{s}</button>
          ))}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f5f0f0" }}>
              {["Order ID", "Customer", "Product", "Date", "Total", "Status"].map(h => (
                <th key={h} style={{ padding: "11px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#aaa", letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o, i) => (
              <tr key={o.id} className="cm-row" style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f8f2f2" : "none", background: "#fff" }}>
                <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: "#8b0000" }}>{o.id}</td>
                <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 500, color: "#333" }}>{o.customer}</td>
                <td style={{ padding: "14px 20px", fontSize: 13, color: "#777" }}>{o.product}</td>
                <td style={{ padding: "14px 20px", fontSize: 13, color: "#aaa" }}>{o.date}</td>
                <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "#333" }}>${o.total.toLocaleString()}.00</td>
                <td style={{ padding: "14px 20px" }}><StatusBadge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "14px 20px", borderTop: "1px solid #f5f0f0" }}>
          <span style={{ fontSize: 13, color: "#bbb" }}>Showing {filtered.length} of {orders.length} orders</span>
        </div>
      </Card>
    </main>
  );
}