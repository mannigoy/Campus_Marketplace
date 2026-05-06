import { useState, useEffect } from "react";
import { PageHeader, Card } from "../../components/Shared";
import { useAuth } from "../../AuthContext";

const API_BASE = "http://localhost:8080/api";

export default function SettingsPage() {
  const { token } = useAuth();
  
  // Start with default empty values so the UI doesn't break before data loads
  const [store, setStore] = useState({ id: null, ownerId: null, name: "", email: "", currency: "PHP", description: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const safeJson = async (res) => {
    try {
      return await res.json();
    } catch {
      return {};
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/seller/store`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await safeJson(res);
        
        if (res.ok) {
          setStore((previous) => ({
            ...previous,
            id: data.id || previous.id,
            ownerId: data.userId || previous.ownerId,
            name: data.storeName || "",
            description: data.description || "",
          }));
          return;
        }

        const fallbackRes = await fetch(`${API_BASE}/seller/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const fallbackData = await safeJson(fallbackRes);
        if (!fallbackRes.ok) {
          setError(data.error || fallbackData.error || "Failed to load settings.");
          return;
        }

        const info = fallbackData.store || {};
        setStore((previous) => ({
          ...previous,
          id: info.id || previous.id,
          ownerId: info.userId || fallbackData.sellerId || previous.ownerId,
          name: info.storeName || fallbackData.storeName || previous.name,
          description: info.description || previous.description,
        }));
      } catch {
        setError("Cannot reach server.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadSettings();
    } else {
      setError("You are not logged in.");
      setLoading(false);
    }
  }, [token]);

  const set = (k, v) => setStore(p => ({ ...p, [k]: v }));

  const saveChanges = async () => {
    if (!store.name?.trim()) {
      setError("Store name is required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      storeName: store.name.trim(),
      description: store.description,
    };

    try {
      const res = await fetch(`${API_BASE}/seller/store`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const body = await safeJson(res);
      if (res.ok) {
        setSuccess("Settings saved.");
        setStore((previous) => ({
          ...previous,
          id: body.id || previous.id,
          ownerId: body.userId || previous.ownerId,
          name: body.storeName || previous.name,
          description: body.description ?? previous.description,
        }));
        return;
      }

      if (res.status === 404 && store.id) {
        const legacyRes = await fetch(`${API_BASE}/seller/stores/${store.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const legacyBody = await safeJson(legacyRes);

        if (!legacyRes.ok) {
          setError(legacyBody.error || body.error || "Failed to save settings.");
          return;
        }

        setSuccess("Settings saved.");
        setStore((previous) => ({
          ...previous,
          id: legacyBody.id || previous.id,
          ownerId: legacyBody.userId || previous.ownerId,
          name: legacyBody.storeName || previous.name,
          description: legacyBody.description ?? previous.description,
        }));
        return;
      }

      setError(body.error || "Failed to save settings.");
    } catch {
      setError("Cannot reach server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "28px", color: "#666" }}>Loading settings...</div>;

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px" }}>
      <PageHeader 
        title="Settings" 
        subtitle="Manage your store preferences and account details." 
        actions={<button className="cm-btn-primary" onClick={saveChanges} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>} 
      />
      
      {error && (
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px 16px", borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: "#ecfdf5", color: "#065f46", padding: "12px 16px", borderRadius: 8, marginBottom: 16 }}>
          {success}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card style={{ padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 16 }}>Store Details</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[{ label: "Store Name", key: "name" }, { label: "Store Description", key: "description" }].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 12, color: "#888", fontWeight: 500, display: "block", marginBottom: 6 }}>{f.label}</label>
                {f.key === "description" ? (
                  <textarea className="cm-input" rows={4} value={store[f.key] || ""} onChange={e => set(f.key, e.target.value)} />
                ) : (
                  <input className="cm-input" value={store[f.key] || ""} onChange={e => set(f.key, e.target.value)} />
                )}
              </div>
            ))}
          
          </div>
        </Card>
        
       
        
      </div>
    </main>
  );
}