import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getShop, getShopProducts } from "../api/catalogApi";
import "../styles/shop.css";
import denImg from "../assets/den.jpg";

export default function ShopDetails() {
  const { shopId } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [shopData, productData] = await Promise.all([
          getShop(shopId),
          getShopProducts(shopId),
        ]);
        if (!mounted) return;
        setShop(shopData);
        setProducts(productData.items);
      } catch {
        if (!mounted) return;
        setError("Failed to load shop.");
        setShop(null);
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [shopId]);

  return (
    <div className="shop-page">
      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">{shop?.name || "Shop"}</h2>
            <p className="section-text">{shop?.description || "Browse items from this shop."}</p>
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
          <div className="section-text">No products found for this shop.</div>
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
