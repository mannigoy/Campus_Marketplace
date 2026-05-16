import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../AuthContext";
import "../styles/Cart.css";

// Internal assets
import denImg from "../assets/den.jpg";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const userTouchedSelection = useRef(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  // Load cart from Backend Database
  const loadCart = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8080/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // res.data is a List<CartItem>, where each item has a .product object
      setCartItems(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [token]);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${typeof token === "string" ? token.trim() : ""}`,
  });

  // Remove one instance of an item
  const removeItem = async (productId) => {
    if (!token) {
      alert("Please log in to update your cart.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/api/cart/remove",
        { productId: productId },
        { headers: getAuthHeaders() }
      );
      // Refresh the cart after database update
      loadCart();
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Could not remove item from server.");
    }
  };

  // Add one instance of an item
  const addItem = async (productId) => {
    if (!token) {
      alert("Please log in to update your cart.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/api/cart/add",
        { productId: productId },
        { headers: getAuthHeaders() }
      );
      loadCart();
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Could not add item to cart.");
    }
  };

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set();
      if (!userTouchedSelection.current) {
        cartItems.forEach((item) => next.add(item.id));
        return next;
      }

      cartItems.forEach((item) => {
        if (prev.has(item.id)) {
          next.add(item.id);
        }
      });

      return next;
    });
  }, [cartItems]);

  const toggleSelected = (itemId) => {
    userTouchedSelection.current = true;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const selectedItems = cartItems.filter((item) => selectedIds.has(item.id));
  const selectedCount = selectedItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  // Calculate total price using nested product.price
  const totalPrice = selectedItems.reduce(
    (total, item) => total + (Number(item.product?.price || 0) * (item.quantity || 1)),
    0
  );

  const proceedToCheckout = () => {
    if (!token) {
      alert("Please sign in before checking out.");
      return;
    }

    if (selectedItems.length === 0) {
      alert("Please select at least one item to checkout.");
      return;
    }

    navigate("/checkout", {
      state: { selectedCartItemIds: selectedItems.map((item) => item.id) },
    });
  };

  if (loading) {
    return <div className="body"><p style={{textAlign: 'center', padding: '2rem'}}>Loading your cart...</p></div>;
  }

  return (
  <div className="cart-page">
    <h2 className="cart-title">
      Shopping Cart <span>({cartItems.length} Items)</span>
    </h2>

    <div className="cart-layout">
      {/* Left: item rows */}
      <div className="cart-left">
        <div className="cart-col-headers">
          <span></span><span></span>
          <span>Product Details</span>
          <span>Quantity</span>
          <span>Price</span>
        </div>

        {cartItems.map((item) => (
          <div className="cart-row" key={item.id}>
            <input
              type="checkbox"
              className="cart-check"
              checked={selectedIds.has(item.id)}
              onChange={() => toggleSelected(item.id)}
            />
            <img src={item.product?.imageUrl || denImg} className="cart-img" alt={item.product?.name} />
            <div>
              <div className="cart-brand">{item.product?.brand || "Brand"}</div>
              <div className="cart-name">{item.product?.name}</div>
             
              <button className="remove-link" onClick={() => removeItem(item.product?.id)}>
                Remove
              </button>
            </div>
            <div className="qty-wrap">
              <button
                className="qty-btn"
                type="button"
                onClick={() => removeItem(item.product?.id)}
              >
                −
              </button>
              <input className="qty-num" value={item.quantity} readOnly />
              <button
                className="qty-btn"
                type="button"
                onClick={() => addItem(item.product?.id)}
              >
                +
              </button>
            </div>
            <div className="cart-price">₱{Number(item.product?.price || 0).toLocaleString()}</div>
          </div>
        ))}

        <div className="cart-footer-bar">
          <span className="selected-badge">
            {selectedCount} item{selectedCount === 1 ? "" : "s"} selected for checkout
          </span>
          <span>Only checked items are included in the order summary.</span>
        </div>
      </div>

      {/* Right: Order summary */}
      <div className="order-summary">
        <div className="summary-title">Order Summary</div>
        {/* Promo/voucher temporarily disabled */}
        {/*
        <div className="promo-wrap">
          <input className="promo-input" placeholder="Promo or Gift Code" />
          <button className="promo-btn">Apply</button>
        </div>
        */}
        <div className="summary-row"><span>Selected Items</span><span className="val">{selectedCount}</span></div>
        <div className="summary-row"><span>Subtotal</span><span className="val">₱{totalPrice.toLocaleString()}</span></div>
        
       
        <hr className="summary-divider" />
        <div className="summary-total">
          <span className="label">Total</span>
          <span className="amount">₱{totalPrice.toLocaleString()}</span>
        </div>
        <button
          className="checkout-btn"
          type="button"
          disabled={selectedItems.length === 0}
          onClick={proceedToCheckout}
        >
          Proceed to Checkout
        </button>
        <div className="secure-note">Secure Checkout Guarantee</div>
      </div>
    </div>
  </div>
);
}