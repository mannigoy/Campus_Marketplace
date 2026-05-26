import { useEffect, useState } from "react";
import "../styles/MyOrders.css";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canceling, setCanceling] = useState({});

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8080/api/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load orders");
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const cancelOrder = async (orderId) => {
    setCanceling((prev) => ({ ...prev, [orderId]: true }));
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to cancel order");
        return;
      }

      setOrders((prev) => prev.map((order) => (order.id === data.id ? data : order)));
    } catch (err) {
      setError(err.message || "Failed to cancel order");
    } finally {
      setCanceling((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  if (loading) {
    return <div className="orders-page">Loading orders...</div>;
  }

  if (error) {
    return <div className="orders-page error-message">{error}</div>;
  }

  return (
    <section className="orders-page">
      <div className="orders-container">
        <h1>My Orders</h1>
        <p className="orders-subtitle">View your recent campus marketplace purchases.</p>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <h2>No orders yet</h2>
            <p>Your placed orders will appear here after checkout.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="order-header">
                  <div>
                    <h2>Order #{order.id}</h2>
                    <p>{new Date(order.createdAt).toLocaleString()}</p>
                  </div>

                  <span className="order-status">{order.orderStatus}</span>
                </div>

                <div className="order-details">
                  <p><strong>Pickup Date:</strong> {order.pickupDate}</p>
                  <p><strong>Pickup Time:</strong> {order.pickupTime}</p>
                  <p><strong>Pickup Location:</strong> {order.pickupLocation}</p>
                  <p><strong>Payment:</strong> {order.paymentMethod}</p>
                  <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                </div>

                <div className="order-items">
                  {order.items.map((item) => (
                    <div className="order-item" key={item.id}>
                      <div className="order-item-info">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="order-item-image"
                            loading="lazy"
                          />
                        ) : (
                          <div className="order-item-image order-item-image-fallback">
                            No Image
                          </div>
                        )}
                        <div>
                          <h3>{item.productName}</h3>
                          <p>Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <strong>₱{item.lineTotal}</strong>
                    </div>
                  ))}
                </div>

                <div className="order-total">
                  <span>Total</span>
                  <strong>₱{order.totalAmount}</strong>
                </div>
                {order.orderStatus === "PENDING" && order.paymentStatus === "UNPAID" && (
                  <div className="order-actions">
                    <button
                      className="order-cancel-btn"
                      onClick={() => cancelOrder(order.id)}
                      disabled={!!canceling[order.id]}
                    >
                      {canceling[order.id] ? "Cancelling..." : "Cancel Order"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}