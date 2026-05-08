import { useAuth } from "../AuthContext";
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
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Backend-integrated Add to Cart function
  const addToCart = async (product) => {
    console.log("Button clicked for product:", product.id);
    console.log("Current Token in State:", token);
    if (!token) {
      alert("Please log in to add items to your cart.");
      return;
    }

    try {
      // Sending request to CartController.java
      await axios.post(
        "http://localhost:8080/api/cart/add",
        { productId: product.id }, // Request body matches your Controller's Map<String, Long>
        {
          headers: { Authorization: `Bearer ${token.trim()}` },
        }
      );
      
      alert(`Success! ${product.name} added to your cart.`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorMsg = error.response?.data?.message || "Failed to add item to cart.";
      alert(errorMsg);
    }
  };

  return (
    <div className="shop-page">
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
            <div key={product.id} className="product-card">
              <div className="product-image-wrap">
                <img 
                  src={product.imageUrl || denImg} 
                  alt={product.name} 
                  className="product-image" 
                />
                {/* Visual flair: NEW badge for even IDs or specific categories */}
                {product.id % 2 === 0 && <span className="new-badge">NEW</span>}
              </div>
              
              <span className="product-brand">{product.category || "General"}</span>
              <span className="product-name">{product.name}</span>
              
              <div className="product-bottom">
                <span className="product-price">
                  ₱{Number(product.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>

                <button 
                  className="add-cart-btn" 
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}