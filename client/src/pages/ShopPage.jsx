import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/shop.css"; 

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

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("http://localhost:8080/api/products");
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch {
        setError("Cannot reach server.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="shop-page">
      {/* HERO SECTION */}
      
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
          {!loading && products.length === 0 && (
            <div className="section-text">No products available yet.</div>
          )}
          {!loading && products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-wrap">
                <img src={product.imageUrl || denImg} alt={product.name} className="product-image" />
                {product.id % 2 === 0 && <span className="new-badge">NEW</span>}
              </div>
              <span className="product-brand">{product.category || "Uncategorized"}</span>
              <span className="product-name">{product.name}</span>
              <span className="product-price">₱{Number(product.price || 0).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}