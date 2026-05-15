import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getCategory, getCategoryProducts } from "../api/catalogApi";
import "../styles/shop.css";
import denImg from "../assets/den.jpg";

export default function CategoryDetails() {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [categoryData, productData] = await Promise.all([
          getCategory(categoryId),
          getCategoryProducts(categoryId),
        ]);
        if (!mounted) return;
        setCategory(categoryData);
        setProducts(productData.items);
      } catch {
        if (!mounted) return;
        setError("Failed to load category.");
        setCategory(null);
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [categoryId]);

  return (
    <div className="shop-page">
      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">{category?.name || "Category"}</h2>
            <p className="section-text">{category?.description || "Browse items in this category."}</p>
          </div>
          <Link to="/products" className="view-all-link">View all products</Link>
        </div>

        {error && (
          <div className="section-text" style={{ color: "#b91c1c", marginBottom: 12 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="section-text">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="section-text">No products found in this category.</div>
        ) : (
          <div className="products-grid products-grid-large">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                fallbackImage={denImg}
                showStoreName
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
