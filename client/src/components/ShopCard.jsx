import React from "react";
import { useNavigate } from "react-router-dom";

export default function ShopCard({ shop, fallbackImage }) {
  const navigate = useNavigate();

  if (!shop) return null;

  const handleNavigate = () => {
    navigate(`/shop/${shop.id}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigate();
    }
  };

  return (
    <div
      className="shop-card"
      role="button"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      aria-label={`View shop ${shop.name}`}
    >
      <div className="shop-image-wrap">
        <img
          src={shop.imageUrl || fallbackImage}
          alt={shop.name}
          className="shop-image"
        />
      </div>
      <div className="shop-card-content">
        <div className="shop-card-title">{shop.name}</div>
        <div className="shop-card-description">{shop.description || "No description yet."}</div>
        <div className="shop-card-meta">
          {typeof shop.productCount === "number" ? `${shop.productCount} products` : "Browse shop"}
        </div>
      </div>
    </div>
  );
}
