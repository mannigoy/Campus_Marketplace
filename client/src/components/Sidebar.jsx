const NAV = [
  { key: "dashboard", label: "Dashboard"},
  { key: "products", label: "Products"},
  { key: "orders", label: "Orders"},
  { key: "settings", label: "Settings" },
  
  { key: "pending", label: "Pending Applications" },
  { key: "users", label: "Users" },
  { key: "stores", label: "Stores" },
  { key: "categories", label: "Categories" },
];


const menubyRole = {
  SELLER: ["dashboard", "products", "orders", "settings"],
  SUPERADMIN: ["dashboard", "pending", "users", "stores", "products", "categories"],
};

const ROLE_ALIASES = {
  ADMIN: "SUPERADMIN",
};

const normalizeRole = (value) => {
  if (typeof value !== "string") return "";
  const normalized = value.trim().toUpperCase();
  return normalized.startsWith("ROLE_") ? normalized.slice(5) : normalized;
};

const getAllowedKeys = (role) => {
  const normalizedRole = normalizeRole(role);
  const effectiveRole = ROLE_ALIASES[normalizedRole] || normalizedRole;
  const keys = menubyRole[effectiveRole];
  return Array.isArray(keys) ? keys : [];
};

export default function Sidebar({ active, onNavigate, role }) {
  const storedRole = typeof window !== "undefined" ? localStorage.getItem("role") : "";
  const allowedKeys = getAllowedKeys(role || storedRole);

  const filteredNav = NAV.filter((item) => allowedKeys.includes(item.key));


  return (
    <aside style={{ width: 240, background: "#fff", borderRight: "1px solid #f0eaea", display: "flex", flexDirection: "column", padding: "0 0 20px 0", flexShrink: 0 }}>
      
      <nav style={{ flex: 1, padding: "16px 10px" }}>
        {filteredNav.map(({ key, label }) => (
          <button key={key} className={`cm-nav-item${active === key ? " active" : ""}`} onClick={() => onNavigate(key)}>
            
            {label}
          </button>
        ))}
      </nav>
      
    </aside>
  );
}