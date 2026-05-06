export function StatusBadge({ status }) {
  const map = {
    Active: { bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
    "Out of Stock": { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
    Draft: { bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af" },
    Hidden: { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
    Suspended: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
    Inactive: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
    Delivered: { bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
    Processing: { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
    Shipped: { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
    Cancelled: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
  };
  const s = map[status] || map.Draft;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 30, color: "#1a1a1a", fontWeight: 400, marginBottom: 4 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: "#999" }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 10 }}>{actions}</div>}
    </div>
  );
}

export function Card({ children, style }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0eaea", overflow: "hidden", ...style }}>
      {children}
    </div>
  );
}