import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import useAddToCart from "../hooks/useAddToCart";
import MessageBox from "../components/MessageBox";
import "../styles/shop.css";
import denImg from "../assets/den.jpg";

export default function ProductDetails() {
  const { id } = useParams();
  const [cartMessage, setCartMessage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const addToCart = useAddToCart(setCartMessage);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      setLoading(true);
      setError("");

      const productId = Number(id);
      if (!Number.isFinite(productId)) {
        setError("Invalid product.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:8080/api/products");
        const fetchedProducts = res.data.products || res.data;
        const list = Array.isArray(fetchedProducts) ? fetchedProducts : [];
        const found = list.find((item) => Number(item.id) === productId) || null;

        if (isMounted) {
          if (!found) {
            setError("Product not found.");
          }
          setProduct(found);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (isMounted) {
          setError("Could not load product details.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!cartMessage) return undefined;

    const timer = window.setTimeout(() => setCartMessage(null), 2800);
    return () => window.clearTimeout(timer);
  }, [cartMessage]);

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = async () => {
    await addToCart(product, quantity);
  };

  const handleBuyNow = async () => {
    const added = await addToCart(product, quantity);
    if (added) {
      window.location.href = "/checkout";
    }
  };

  if (loading) {
    return (
      <section className="section">
        <p className="section-text">Loading product...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section">
        <p className="section-text" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="section">
        <p className="section-text">Product not available.</p>
      </section>
    );
  }

  return (
    <section className="section product-details">
      <MessageBox
        type={cartMessage?.type || "success"}
        text={cartMessage?.text}
        onClose={() => setCartMessage(null)}
      />
      <div className="product-details-grid">
        <div className="product-details-image-wrap">
          <img
            src={product.imageUrl || denImg}
            alt={product.name}
            className="product-details-image"
          />
        </div>

        <div className="product-details-content">
          <span className="product-details-category">
            {product.category || "General"}
          </span>
          <h1 className="product-details-title">{product.name}</h1>
          <div className="product-details-price">
            ₱{Number(product.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="product-details-description">
            {product.description || "No description available."}
          </p>
          <div className="product-details-quantity">
            <span className="product-details-quantity-label">Quantity</span>
            <div className="product-details-stepper">
              <button type="button" className="product-details-stepper-btn" onClick={handleDecrement} aria-label="Decrease quantity">
                −
              </button>
              <span className="product-details-stepper-value">{quantity}</span>
              <button type="button" className="product-details-stepper-btn" onClick={handleIncrement} aria-label="Increase quantity">
                +
              </button>
            </div>
          </div>

          <div className="product-details-actions">
            <button
              className="add-cart-btn add-cart-btn-large"
              type="button"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>

            <button
              className="buy-now-btn"
              type="button"
              onClick={handleBuyNow}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
