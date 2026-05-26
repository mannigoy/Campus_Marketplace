import { useEffect, useMemo, useState } from "react";
import { PageHeader, Card, StatusBadge } from "../../components/Shared";
import { useAuth } from "../../AuthContext";

const API_BASE = "http://localhost:8080/api";
const ORDER_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "READY_FOR_PICKUP", label: "Ready For Pickup" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];
const STATUS_FILTERS = ["All", ...ORDER_STATUS_OPTIONS.map((option) => option.label)];

const formatStatusLabel = (value) => {
  if (!value || typeof value !== "string") return "Unknown";
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getStatusLabel = (value) => {
  const match = ORDER_STATUS_OPTIONS.find((option) => option.value === value);
  return match ? match.label : formatStatusLabel(value);
};

const formatItems = (items = []) => {
  const names = items.map((item) => item.productName).filter(Boolean);
  if (names.length <= 2) return names.join(", ") || "-";
  return `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
};

const formatCurrency = (value) =>
  `₱${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

export default function OrdersPage() {
  const { token } = useAuth();
  const [filter, setFilter] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marking, setMarking] = useState({});
  const [statusUpdating, setStatusUpdating] = useState({});
  const [statusUpdates, setStatusUpdates] = useState({});

  const loadOrders = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/seller/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to load orders.");
        setOrders([]);
        return;
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Cannot reach server.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  const filtered = useMemo(() => {
    if (filter === "All") return orders;
    return orders.filter((order) => getStatusLabel(order.orderStatus) === filter);
  }, [orders, filter]);

  const markPaid = async (orderId) => {
    if (!token) return;
    setMarking((prev) => ({ ...prev, [orderId]: true }));
    setError("");
    try {
      const response = await fetch(`${API_BASE}/seller/orders/${orderId}/mark-paid`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to update payment status.");
        return;
      }

      setOrders((prev) => prev.map((order) => (order.id === data.id ? data : order)));
    } catch (err) {
      setError(err?.message || "Cannot reach server.");
    } finally {
      setMarking((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const updateOrderStatus = async (orderId, nextStatus) => {
    if (!token) return;
    setStatusUpdating((prev) => ({ ...prev, [orderId]: true }));
    setError("");
    try {
      const response = await fetch(`${API_BASE}/seller/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderStatus: nextStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to update order status.");
        return;
      }

      setOrders((prev) => prev.map((order) => (order.id === data.id ? data : order)));
      setStatusUpdates((prev) => ({ ...prev, [orderId]: data.orderStatus }));
    } catch (err) {
      setError(err?.message || "Cannot reach server.");
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px" }}>
      <PageHeader
        title="Orders"
        subtitle="Track who bought your products, update payment, and manage order status."
        actions={
          <button className="cm-btn-ghost" onClick={loadOrders} disabled={loading}>
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        }
      />

      {error && (
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px 16px", borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <Card style={{ overflowX: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", borderBottom: "1px solid #f5f0f0", flexWrap: "wrap" }}>
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              className="cm-tab"
              onClick={() => setFilter(status)}
              style={{
                border: filter === status ? "1.5px solid #d8b8b8" : "1.5px solid transparent",
                background: filter === status ? "#fff" : "transparent",
                color: filter === status ? "#8b0000" : "#888",
                fontWeight: filter === status ? 600 : 400,
              }}
            >
              {status}
            </button>
          ))}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f5f0f0" }}>
              {[
                "Order ID",
                "Customer",
                "Items",
                "Placed",
                "Subtotal",
                "Payment",
                "Order Status",
                "Action",
              ].map((header) => (
                <th
                  key={header}
                  style={{
                    padding: "11px 20px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#aaa",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} style={{ padding: "18px 20px", color: "#9ca3af" }}>
                  Loading orders...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: "18px 20px", color: "#9ca3af" }}>
                  No orders found.
                </td>
              </tr>
            )}
            {!loading && filtered.map((order, index) => {
              const orderStatusLabel = getStatusLabel(order.orderStatus);
              const paymentStatusLabel = formatStatusLabel(order.paymentStatus);
              const createdAt = order.createdAt ? new Date(order.createdAt) : null;
              const isMarking = !!marking[order.id];
              const canMarkPaid = order.paymentStatus === "UNPAID";
              const selectedStatus = statusUpdates[order.id] || order.orderStatus;
              const isStatusUpdating = !!statusUpdating[order.id];
              const statusChanged = selectedStatus !== order.orderStatus;

              return (
                <tr
                  key={order.id}
                  className="cm-row"
                  style={{
                    borderBottom: index < filtered.length - 1 ? "1px solid #f8f2f2" : "none",
                    background: "#fff",
                  }}
                >
                  <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: "#8b0000" }}>
                    #{order.id}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{order.customerName}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{order.customerEmail}</div>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "#777" }}>
                    {formatItems(order.items)}
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "#aaa" }}>
                    {createdAt ? createdAt.toLocaleString() : "-"}
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "#333" }}>
                    {formatCurrency(order.subtotal)}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <StatusBadge status={paymentStatusLabel} />
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>{order.paymentMethod}</div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <StatusBadge status={orderStatusLabel} />
                      <select
                        value={selectedStatus}
                        onChange={(event) =>
                          setStatusUpdates((prev) => ({
                            ...prev,
                            [order.id]: event.target.value,
                          }))
                        }
                        style={{
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: "1px solid #e5e7eb",
                          fontSize: 12,
                          color: "#374151",
                          background: "#fff",
                        }}
                      >
                        {ORDER_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {canMarkPaid ? (
                        <button
                          className="cm-btn-primary"
                          onClick={() => markPaid(order.id)}
                          disabled={isMarking}
                          style={{ padding: "7px 14px", fontSize: 12 }}
                        >
                          {isMarking ? "Updating..." : "Mark Paid"}
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}>Paid</span>
                      )}
                      <button
                        className="cm-btn-ghost"
                        onClick={() => updateOrderStatus(order.id, selectedStatus)}
                        disabled={!statusChanged || isStatusUpdating}
                        style={{ padding: "6px 12px", fontSize: 12 }}
                      >
                        {isStatusUpdating ? "Saving..." : "Update Status"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ padding: "14px 20px", borderTop: "1px solid #f5f0f0" }}>
          <span style={{ fontSize: 13, color: "#bbb" }}>
            Showing {filtered.length} of {orders.length} orders
          </span>
        </div>
      </Card>
    </main>
  );
}