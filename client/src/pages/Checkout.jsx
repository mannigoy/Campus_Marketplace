import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { useNotifications } from "../NotificationContext.jsx";
import "../styles/Checkout.css";

const API_BASE = "http://localhost:8080";

export default function Checkout() {
  const { token, user } = useAuth();
  const { addNotification } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const selectedCartItemIds = useMemo(() => {
    const ids = location.state?.selectedCartItemIds;
    return Array.isArray(ids) ? ids : [];
  }, [location.state]);

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customerName: user?.username || "",
    customerEmail: user?.email || "",
    contactNumber: "",
    pickupDate: "",
    pickupTime: "",
    pickupLocation: "CIT-U Main Lobby",
    paymentMethod: "Cash on Pickup",
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Please sign in before checking out.");
      return;
    }

    const loadCart = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Checkout cart load error:", err);
        setError("Could not load your cart. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [token]);

  const checkoutItems = useMemo(() => {
    if (selectedCartItemIds.length === 0) return cartItems;
    return cartItems.filter((item) => selectedCartItemIds.includes(item.id));
  }, [cartItems, selectedCartItemIds]);

  const total = checkoutItems.reduce(
    (sum, item) => sum + Number(item.product?.price || 0) * Number(item.quantity || 1),
    0
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.customerName.trim()) return "Full name is required.";
    if (!form.customerEmail.trim()) return "Email address is required.";
    if (!form.contactNumber.trim()) return "Contact number is required.";
    if (!form.pickupDate) return "Pickup date is required.";
    if (!form.pickupTime) return "Pickup time is required.";
    if (!form.pickupLocation.trim()) return "Pickup location is required.";
    if (!form.paymentMethod.trim()) return "Payment method is required.";
    if (checkoutItems.length === 0) return "No items selected for checkout.";
    return "";
  };

  const placeOrder = async () => {
    setError("");
    setMessage("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(
        `${API_BASE}/api/orders/checkout`,
        {
          ...form,
          cartItemIds: checkoutItems.map((item) => item.id),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const orderId = response.data?.id || "#";
      setMessage(`Order placed successfully. Order ${orderId}`);
      addNotification({
        title: "Order Confirmed",
        message: `Your order ${orderId} was placed successfully.`,
        type: "success",
      });
      setTimeout(() => navigate("/cart"), 1200);
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.response?.data?.error || "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="checkout-page"><p className="checkout-loading">Loading checkout...</p></div>;
  }

  return (
    <section className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-main">
          <div className="checkout-header">
            <h1>Checkout</h1>
            <p>Complete your order details and pickup schedule.</p>
          </div>

          {error && <div className="checkout-alert error">{error}</div>}
          {message && <div className="checkout-alert success">{message}</div>}

          <div className="checkout-card">
            <h2>Customer Information</h2>

            <label htmlFor="customerName">Full Name</label>
            <input
              id="customerName"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              placeholder="Enter your full name"
            />

            <label htmlFor="customerEmail">Email Address</label>
            <input
              id="customerEmail"
              name="customerEmail"
              type="email"
              value={form.customerEmail}
              onChange={handleChange}
              placeholder="Enter your email address"
            />

            <label htmlFor="contactNumber">Contact Number</label>
            <input
              id="contactNumber"
              name="contactNumber"
              value={form.contactNumber}
              onChange={handleChange}
              placeholder="Enter your contact number"
            />
          </div>

          <div className="checkout-card">
            <h2>Pickup Details</h2>

            <div className="checkout-two-col">
              <div>
                <label htmlFor="pickupDate">Pickup Date</label>
                <input
                  id="pickupDate"
                  name="pickupDate"
                  type="date"
                  value={form.pickupDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="pickupTime">Pickup Time</label>
                <input
                  id="pickupTime"
                  name="pickupTime"
                  type="time"
                  value={form.pickupTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label htmlFor="pickupLocation">Pickup Location</label>
            <select
              id="pickupLocation"
              name="pickupLocation"
              value={form.pickupLocation}
              onChange={handleChange}
            >
              <option value="CIT-U Main Lobby">CIT-U Main Lobby</option>
              <option value="Wildcats Den">Wildcats Den</option>
              <option value="Student Activity Center">Student Activity Center</option>
              <option value="CCS Department Office">CCS Department Office</option>
            </select>
          </div>

          <div className="checkout-card">
            <h2>Payment Method</h2>
            <div className="payment-methods">
              {['Cash on Pickup', 'GCash', 'Card'].map((method) => (
                <button
                  key={method}
                  type="button"
                  className={form.paymentMethod === method ? "selected" : ""}
                  onClick={() => setForm((prev) => ({ ...prev, paymentMethod: method }))}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="checkout-summary">
          <h2>Order Summary</h2>

          {checkoutItems.length === 0 ? (
            <p className="empty-summary">No items selected.</p>
          ) : (
            checkoutItems.map((item) => (
              <div className="summary-item" key={item.id}>
                <div>
                  <h3>{item.product?.name || "Product"}</h3>
                  <p>Qty: {item.quantity || 1}</p>
                </div>
                <strong>
                  ₱{(Number(item.product?.price || 0) * Number(item.quantity || 1)).toLocaleString()}
                </strong>
              </div>
            ))
          )}

          <div className="summary-total">
            <span>Total</span>
            <strong>₱{total.toLocaleString()}</strong>
          </div>

          <button
            type="button"
            className="place-order-btn"
            disabled={submitting || checkoutItems.length === 0}
            onClick={placeOrder}
          >
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </aside>
      </div>
    </section>
  );
}
