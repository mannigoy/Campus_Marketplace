import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProductCard({
  product,
  onAddToCart,
  fallbackImage,
  showStoreName = false,
}) {
  const navigate = useNavigate();

  if (!product) return null;

  const handleNavigate = () => {
    navigate(`/products/${product.id}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigate();
    }
  };

  const handleAddToCart = (event) => {
    event.stopPropagation();
    if (typeof onAddToCart === "function") {
      onAddToCart(product, 1);
    }
  };

  return (
    <div
      className="product-card product-card-clickable"
      role="button"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      aria-label={`View details for ${product.name}`}
    >
      <div className="product-image-wrap">
        <img
          src={product.imageUrl || fallbackImage}
          alt={product.name}
          className="product-image"
        />
        {product.id % 2 === 0 && <span className="new-badge">NEW</span>}
      </div>

      {showStoreName && product.storeName && (
        <span className="product-store">{product.storeName}</span>
      )}
      <span className="product-brand">{product.category || "General"}</span>
      <span className="product-name">{product.name}</span>


      <div className="product-bottom">
        <span className="product-price">
          ₱{Number(product.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>

    </div>
  );
}
