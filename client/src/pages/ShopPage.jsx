import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/shop.css"; 
import ProductCard from "../components/ProductCard";
import ShopCard from "../components/ShopCard";
import useAddToCart from "../hooks/useAddToCart";
import MessageBox from "../components/MessageBox";
import { getCategories, getProducts, getShops } from "../api/catalogApi";

// Internal assets
import denImg from "../assets/den.jpg";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [shops, setShops] = useState([]);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [shopsError, setShopsError] = useState("");
  const [cartMessage, setCartMessage] = useState(null);
  const addToCart = useAddToCart(setCartMessage);

  // Load products from the Spring Boot API
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const { items } = await getProducts({ size: 6, sort: "name_asc" });
        setProducts(Array.isArray(items) ? items : []);
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
    const loadCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError("");
      try {
        const data = await getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Category fetch error:", err);
        setCategories([]);
        setCategoriesError("Failed to load categories.");
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadShops = async () => {
      setShopsLoading(true);
      setShopsError("");
      try {
        const data = await getShops();
        setShops(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Shop fetch error:", err);
        setShops([]);
        setShopsError("Failed to load shops.");
      } finally {
        setShopsLoading(false);
      }
    };

    loadShops();
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
          {categoriesLoading && (
            <div className="section-text">Loading categories...</div>
          )}

          {!categoriesLoading && categoriesError && (
            <div className="section-text" style={{ color: "#b91c1c" }}>
              {categoriesError}
            </div>
          )}

          {!categoriesLoading && !categoriesError && categories.length === 0 && (
            <div className="section-text">No categories available yet.</div>
          )}

          {!categoriesLoading && !categoriesError && categories.map((cat) => (
            <Link
              key={cat.id || cat.name}
              to={`/category/${cat.id}`}
              className="category-card category-card-clickable"
            >
              <img src={denImg} alt={cat.name} className="category-image" />
              <div className="category-overlay" />
              <div className="category-content">
                <div className="category-card-title">{cat.name}</div>
                <span className="category-link">
                  {cat.description || "Shop Now"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BROWSE SHOPS SECTION */}
      <section className="section section-gray">
        <div className="section-header">
          <div>
            <h2 className="section-title">Browse Shops</h2>
            <p className="section-text">Discover campus organizations and storefronts.</p>
          </div>
        </div>

        <div className="shops-grid">
          {shopsLoading && (
            <div className="section-text">Loading shops...</div>
          )}

          {!shopsLoading && shopsError && (
            <div className="section-text" style={{ color: "#b91c1c" }}>
              {shopsError}
            </div>
          )}

          {!shopsLoading && !shopsError && shops.length === 0 && (
            <div className="section-text">No shops available yet.</div>
          )}

          {!shopsLoading && !shopsError && shops.map((shop) => (
            <ShopCard key={shop.id || shop.name} shop={shop} fallbackImage={denImg} />
          ))}
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Trending Products</h2>
            <p className="section-text">Popular items from the latest campus releases.</p>
          </div>
          <Link to="/products" className="view-all-link">View All Products</Link>
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