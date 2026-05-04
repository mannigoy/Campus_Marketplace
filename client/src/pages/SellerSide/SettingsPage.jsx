import { useState, useEffect } from "react";
import { PageHeader, Card } from "../../components/Shared";
import { useAuth } from "../../AuthContext";

const API_BASE = "http://localhost:8080/api";

export default function SettingsPage() {
  const { token } = useAuth();
  
  // Start with default empty values so the UI doesn't break before data loads
  const [store, setStore] = useState({ name: "", email: "", currency: "PHP", description: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setError("");
      try {
        // Adjust the endpoint to match your actual settings route
        const res = await fetch(`${API_BASE}/seller/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.error || "Failed to load settings.");
          return;
        }
        
        // Assuming your API returns the store object
        if (data.store) {
           setStore(data.store);
        }
      } catch {
        setError("Cannot reach server.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadSettings();
    }
  }, [token]);

  const set = (k, v) => setStore(p => ({ ...p, [k]: v }));

  if (loading) return <div style={{ padding: "28px", color: "#666" }}>Loading settings...</div>;

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px" }}>
      <PageHeader 
        title="Settings" 
        subtitle="Manage your store preferences and account details." 
        actions={<button className="cm-btn-primary">Save Changes</button>} 
      />
      
      {error && (
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px 16px", borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card style={{ padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 16 }}>Store Details</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[{ label: "Store Name", key: "name" }, { label: "Contact Email", key: "email" }, { label: "Store Description", key: "description" }].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 12, color: "#888", fontWeight: 500, display: "block", marginBottom: 6 }}>{f.label}</label>
                <input className="cm-input" value={store[f.key] || ""} onChange={e => set(f.key, e.target.value)} />
              </div>
            ))}
          
          </div>
        </Card>
        
       
        
      </div>
    </main>
  );
}