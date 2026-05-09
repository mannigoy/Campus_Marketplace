import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import "../styles/Cart.css";

// Internal assets
import denImg from "../assets/den.jpg";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

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

  // Remove one instance of an item
  const removeItem = async (productId) => {
    try {
      await axios.post(
        "http://localhost:8080/api/cart/remove",
        { productId: productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh the cart after database update
      loadCart();
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Could not remove item from server.");
    }
  };

  // Calculate total price using nested product.price
  const totalPrice = cartItems.reduce(
    (total, item) => total + (Number(item.product?.price || 0) * (item.quantity || 1)),
    0
  );

  if (loading) {
    return <div className="body"><p style={{textAlign: 'center', padding: '2rem'}}>Loading your cart...</p></div>;
  }

  return (
    <div className="body">
      <table className="cart_table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Product Name</th>
            <th>Price</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Remove</th>
          </tr>
        </thead>

        <tbody>
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <img
                    src={item.product?.imageUrl || denImg}
                    alt={item.product?.name}
                    className="product_img"
                  />
                </td>

                <td>{item.product?.name}</td>

                <td>₱{Number(item.product?.price || 0).toLocaleString()}</td>

                <td>{item.product?.description || "No description"}</td>

                <td>{item.quantity}</td>

                <td>
                  <button
                    className="remove-btn"
                    onClick={() => removeItem(item.product?.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                Your cart is empty.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="cart-total">
        Total: ₱{totalPrice.toLocaleString()}
      </h2>
    </div>
  );
}