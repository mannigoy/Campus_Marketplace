import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/shop.css"; 
import ProductCard from "../components/ProductCard";
import useAddToCart from "../hooks/useAddToCart";
import MessageBox from "../components/MessageBox";

// Internal assets
import denImg from "../assets/den.jpg";

const categories = [
  { title: "Food and Beverages", shopLabel: "Shop Food", image: denImg },
  { title: "Stickers and Pins", shopLabel: "Shop Stickers", image: denImg },
  { title: "CIT-U Official Items", shopLabel: "Shop Official", image: denImg },
];

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState(null);
  const addToCart = useAddToCart(setCartMessage);

  // Load products from the Spring Boot API
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8080/api/products");
        console.log("Full API Response:", res.data); // Look at this in F12 Console!
        
        // If your backend returns an object with a products list inside:
        const fetchedProducts = res.data.products || res.data; 
        setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (!cartMessage) return undefined;

    const timer = window.setTimeout(() => setCartMessage(null), 2800);
    return () => window.clearTimeout(timer);
  }, [cartMessage]);

  return (
    <div className="shop-page">
      <MessageBox
        type={cartMessage?.type || "success"}
        text={cartMessage?.text}
        onClose={() => setCartMessage(null)}
      />
      {/* HERO SECTION */}
      {/* You can re-add your Hero content here if needed */}

      {/* CATEGORIES SECTION */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Categories</h2>
            <p className="section-text">Browse official merchandise by collection.</p>
          </div>
        </div>

        <div className="category-grid">
          {categories.map((cat) => (
            <div key={cat.title} className="category-card">
              <img src={cat.image} alt={cat.title} className="category-image" />
              <div className="category-overlay" />
              <div className="category-content">
                <div className="category-card-title">{cat.title}</div>
                <a href="#" className="category-link">{cat.shopLabel}</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section className="section section-gray">
        <div className="section-header">
          <div>
            <h2 className="section-title">Trending Products</h2>
            <p className="section-text">Popular items from the latest campus releases.</p>
          </div>
          <a href="#" className="view-all-link">View All Products</a>
        </div>

        {error && (
          <div className="section-text" style={{ color: "#b91c1c", marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div className="products-grid">
          {loading && (
            <div className="section-text">Loading products...</div>
          )}
          
          {!loading && products.length === 0 && !error && (
            <div className="section-text">No products available yet. Check back later!</div>
          )}

          {!loading && products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              fallbackImage={denImg}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      </section>
    </div>
  );
}