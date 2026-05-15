import { useEffect, useState } from "react";
import intramsShirt from "../assets/intrams_shirt.jpg";
import denImg from "../assets/den.jpg";
import pushPin from "../assets/push.jpg";
import lanyard from "../assets/gdg_lanyard.jpg";

const API_BASE = "http://localhost:8080/api";

const trendingProducts = [
  {
    id: 1,
    brand: "Wildcats Den",
    name: "Wildcats T-Shirt",
    price: "₱500.00",
    isNew: true,
    image: denImg,
  },
  {
    id: 2,
    brand: "Wildcats Den",
    name: "Intrams Shirt",
    price: "₱450.00",
    isNew: true,
    image: intramsShirt,
  },
  {
    id: 3,
    brand: "Push: Printing and Pins",
    name: "Intramurals Pins",
    price: "₱30.00",
    isNew: false,
    image: pushPin,
  },
  {
    id: 4,
    brand: "GDG CIT-U Merch",
    name: "GDG CIT-U Lanyard",
    price: "₱250.00",
    isNew: false,
    image: lanyard,
  },
];

function useViewport() {
  const [width, setWidth] = useState(
    typeof window === "undefined" ? 1200 : window.innerWidth
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return {
    isMobile: width < 768,
    isTablet: width < 1024,
  };
}

const styles = {
  page: {
    width: "100%",
    overflowX: "hidden",
    background: "#ffffff",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    background: "#fff7f3",
    minHeight: 520,
  },
  heroMobile: {
    gridTemplateColumns: "1fr",
  },
  heroLeft: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "56px 48px",
  },
  heroLeftMobile: {
    padding: "36px 20px",
  },
  badge: {
    display: "inline-flex",
    width: "fit-content",
    padding: "6px 14px",
    background: "#fce8ec",
    borderRadius: 999,
    color: "#800020",
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 22,
  },
  heroTitle: {
    fontSize: 56,
    lineHeight: 1.08,
    color: "#1c1b1f",
    marginBottom: 18,
    fontWeight: 700,
  },
  heroTitleMobile: {
    fontSize: 38,
  },
  heroText: {
    color: "#666",
    fontSize: 16,
    lineHeight: 1.7,
    marginBottom: 28,
    maxWidth: 480,
  },
  heroButtons: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  primaryButton: {
    background: "#800020",
    color: "white",
    border: "none",
    padding: "14px 26px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryButton: {
    background: "transparent",
    color: "#1c1b1f",
    border: "1px solid #d7d7d7",
    padding: "14px 26px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  heroRight: {
    minHeight: 520,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  section: {
    padding: "56px 48px",
  },
  sectionMobile: {
    padding: "36px 20px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
    marginBottom: 28,
  },
  sectionHeaderMobile: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  sectionTitle: {
    fontSize: 34,
    color: "#1c1b1f",
    marginBottom: 6,
  },
  sectionText: {
    color: "#777",
    fontSize: 15,
  },
  link: {
    color: "#800020",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14,
  },
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 20,
  },
  categoryGridMobile: {
    gridTemplateColumns: "1fr",
  },
  categoryCard: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    height: 360,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  categoryOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.15))",
  },
  categoryContent: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
  },
  categoryTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: 600,
    marginBottom: 8,
  },
  categoryLink: {
    color: "white",
    textDecoration: "none",
    fontSize: 14,
  },
  productsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 20,
  },
  productsGridMobile: {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  productCard: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  productImageWrap: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    aspectRatio: "3 / 4",
    background: "#eee",
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  newBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    background: "#800020",
    color: "white",
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 999,
  },
  productBrand: {
    color: "#888",
    fontSize: 12,
  },
  productName: {
    color: "#1c1b1f",
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1.4,
  },
  productPrice: {
    color: "#800020",
    fontSize: 14,
    fontWeight: 600,
  },
};

export default function Marketplace() {
  const { isMobile, isTablet } = useViewport();
  const stacked = isMobile || isTablet;
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError("");
      try {
        const res = await fetch(`${API_BASE}/categories`);
        const data = await res.json();
        if (!res.ok) {
          setCategoriesError(data.error || "Failed to load categories.");
          setCategories([]);
          return;
        }
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        setCategories([]);
        setCategoriesError("Failed to load categories.");
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <div style={styles.page}>
      <section
        style={{
          ...styles.hero,
          ...(stacked ? styles.heroMobile : {}),
        }}
      >
        <div
          style={{
            ...styles.heroLeft,
            ...(stacked ? styles.heroLeftMobile : {}),
          }}
        >
          <span style={styles.badge}>NEW INTRAMS COLLECTION</span>

          <h1
            style={{
              ...styles.heroTitle,
              ...(isMobile ? styles.heroTitleMobile : {}),
            }}
          >
            Official
            <br />
            Intramurals
            <br />
            Shirt Reveal
          </h1>

          <p style={styles.heroText}>
            The official Magic Knight-themed intramurals shirt is now available
            for the campus community.
          </p>

          <div style={styles.heroButtons}>
            <button type="button" style={styles.primaryButton}>
              Shop Collection
            </button>
            <button type="button" style={styles.secondaryButton}>
              Explore Lookbook
            </button>
          </div>
        </div>

        <div style={styles.heroRight}>
          <img
            src={intramsShirt}
            alt="Intrams Shirt"
            style={styles.heroImage}
          />
        </div>
      </section>

      <section
        style={{
          ...styles.section,
          ...(isMobile ? styles.sectionMobile : {}),
        }}
      >
        <div
          style={{
            ...styles.sectionHeader,
            ...(isMobile ? styles.sectionHeaderMobile : {}),
          }}
        >
          <div>
            <h2 style={styles.sectionTitle}>Categories</h2>
            <p style={styles.sectionText}>
              Browse official merchandise by collection.
            </p>
          </div>
        </div>

        <div
          style={{
            ...styles.categoryGrid,
            ...(isMobile ? styles.categoryGridMobile : {}),
          }}
        >
          {categoriesLoading && (
            <div style={styles.sectionText}>Loading categories...</div>
          )}

          {!categoriesLoading && categoriesError && (
            <div style={{ ...styles.sectionText, color: "#b91c1c" }}>
              {categoriesError}
            </div>
          )}

          {!categoriesLoading && !categoriesError && categories.length === 0 && (
            <div style={styles.sectionText}>No categories available yet.</div>
          )}

          {!categoriesLoading && !categoriesError && categories.map((category) => (
            <div key={category.id || category.name} style={styles.categoryCard}>
              <img
                src={denImg}
                alt={category.name}
                style={styles.categoryImage}
              />
              <div style={styles.categoryOverlay} />
              <div style={styles.categoryContent}>
                <div style={styles.categoryTitle}>{category.name}</div>
                <a href="#" style={styles.categoryLink}>
                  {category.description || "Shop Now"}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          ...styles.section,
          ...(isMobile ? styles.sectionMobile : {}),
          background: "#fafafa",
        }}
      >
        <div
          style={{
            ...styles.sectionHeader,
            ...(isMobile ? styles.sectionHeaderMobile : {}),
          }}
        >
          <div>
            <h2 style={styles.sectionTitle}>Trending Products</h2>
            <p style={styles.sectionText}>
              Popular items from the latest campus releases.
            </p>
          </div>

          <a href="#" style={styles.link}>
            View All Products
          </a>
        </div>

        <div
          style={{
            ...styles.productsGrid,
            ...(isMobile ? styles.productsGridMobile : {}),
          }}
        >
          {trendingProducts.map((product) => (
            <div key={product.id} style={styles.productCard}>
              <div style={styles.productImageWrap}>
                <img
                  src={product.image}
                  alt={product.name}
                  style={styles.productImage}
                />
                {product.isNew && <span style={styles.newBadge}>NEW</span>}
              </div>

              <span style={styles.productBrand}>{product.brand}</span>
              <span style={styles.productName}>{product.name}</span>
              <span style={styles.productPrice}>{product.price}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}