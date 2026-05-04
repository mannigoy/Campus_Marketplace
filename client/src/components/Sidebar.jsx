import { DashIcon, ProductIcon, PlusCircleIcon, OrderIcon, AnalyticsIcon, SettingsIcon, LogoutIcon } from "../components/Icons";

const NAV = [
  { key: "dashboard", label: "Dashboard", Icon: DashIcon },
  { key: "products", label: "Products", Icon: ProductIcon },
 
  { key: "orders", label: "Orders", Icon: OrderIcon },
  { key: "analytics", label: "Analytics", Icon: AnalyticsIcon },
  { key: "settings", label: "Settings", Icon: SettingsIcon },
];

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside style={{ width: 240, background: "#fff", borderRight: "1px solid #f0eaea", display: "flex", flexDirection: "column", padding: "0 0 20px 0", flexShrink: 0 }}>
      <div style={{ padding: "22px 24px 20px", borderBottom: "1px solid #f5eeee" }}>
    <div style={{ color: "#800000", fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>
      Campus Marketplace
    </div>
    <div style={{ color: "#800000", fontSize: 12, opacity: 0.85, marginTop: 2 }}>
      CIT-U Official Store
    </div>
  </div>
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {NAV.map(({ key, label, Icon }) => (
          <button key={key} className={`cm-nav-item${active === key ? " active" : ""}`} onClick={() => onNavigate(key)}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
      <div style={{ padding: "0 12px" }}>
        <button className="cm-nav-item" style={{ color: "#999" }}>
          <LogoutIcon size={16} />
          Log Out
        </button>
      </div>
    </aside>
  );
}