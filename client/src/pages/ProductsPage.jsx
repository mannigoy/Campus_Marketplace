import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getCategories, getProducts, getShops } from "../api/catalogApi";
import "../styles/shop.css";
import denImg from "../assets/den.jpg";

const PAGE_SIZE = 12;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 0, size: PAGE_SIZE, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shopId, setShopId] = useState("");
  const [sort, setSort] = useState("name_asc");

  const queryParams = useMemo(() => {
    return {
      page: meta.page,
      size: meta.size,
      search: search.trim() || undefined,
      categoryId: categoryId || undefined,
      shopId: shopId || undefined,
      sort: sort || undefined,
    };
  }, [meta.page, meta.size, search, categoryId, shopId, sort]);

  useEffect(() => {
    let mounted = true;

    const loadFilters = async () => {
      try {
        const [categoryList, shopList] = await Promise.all([
          getCategories(),
          getShops(),
        ]);
        if (!mounted) return;
        setCategories(categoryList);
        setShops(shopList);
      } catch {
        if (!mounted) return;
        setCategories([]);
        setShops([]);
      }
    };

    loadFilters();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const { items, meta: newMeta } = await getProducts(queryParams);
        if (!mounted) return;
        setProducts(items);
        setMeta((prev) => ({ ...prev, ...newMeta }));
      } catch {
        if (!mounted) return;
        setProducts([]);
        setError("Failed to load products.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [queryParams]);

  const handleApplySearch = () => {
    setMeta((prev) => ({ ...prev, page: 0 }));
    setSearch(searchInput);
  };

  const handleCategoryChange = (e) => {
    setCategoryId(e.target.value);
    setMeta((prev) => ({ ...prev, page: 0 }));
  };

  const handleShopChange = (e) => {
    setShopId(e.target.value);
    setMeta((prev) => ({ ...prev, page: 0 }));
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setMeta((prev) => ({ ...prev, page: 0 }));
  };

  const handlePrev = () => {
    setMeta((prev) => ({ ...prev, page: Math.max(prev.page - 1, 0) }));
  };

  const handleNext = () => {
    setMeta((prev) => ({ ...prev, page: Math.min(prev.page + 1, prev.totalPages - 1) }));
  };

  return (
    <div className="shop-page">
      <section className="section section-gray">
        <div className="section-header">
          <div>
            <h2 className="section-title">All Products</h2>
            <p className="section-text">Explore every item in the marketplace.</p>
          </div>
          <Link to="/" className="view-all-link">Back to shop</Link>
        </div>

        <div className="filters-bar">
          <div className="filters-field">
            <label className="filters-label">Search</label>
            <div className="filters-input-group">
              <input
                className="filters-input"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products"
              />
              <button className="filters-button" type="button" onClick={handleApplySearch}>
                Search
              </button>
            </div>
          </div>
          <div className="filters-field">
            <label className="filters-label">Category</label>
            <select className="filters-select" value={categoryId} onChange={handleCategoryChange}>
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="filters-field">
            <label className="filters-label">Shop</label>
            <select className="filters-select" value={shopId} onChange={handleShopChange}>
              <option value="">All shops</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>{shop.name}</option>
              ))}
            </select>
          </div>
          <div className="filters-field">
            <label className="filters-label">Sort by</label>
            <select className="filters-select" value={sort} onChange={handleSortChange}>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="price_asc">Price (Low-High)</option>
              <option value="price_desc">Price (High-Low)</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="section-text" style={{ color: "#b91c1c", marginBottom: 12 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="section-text">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="section-text">No products found. Try adjusting your filters.</div>
        ) : (
          <>
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
            <div className="pagination-bar">
              <button className="filters-button" type="button" onClick={handlePrev} disabled={meta.page <= 0}>
                Previous
              </button>
              <div className="pagination-meta">
                Page {meta.page + 1} of {Math.max(meta.totalPages, 1)}
              </div>
              <button
                className="filters-button"
                type="button"
                onClick={handleNext}
                disabled={meta.page >= meta.totalPages - 1}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
