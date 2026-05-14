import { useAuth } from "../AuthContext";
import axios from "axios";

export default function useAddToCart(notify) {
  const { token } = useAuth();

  const showMessage = (type, text) => {
    if (typeof notify === "function") {
      notify({ type, text });
    }
  };

  return async (product, quantity = 1) => {
    if (!product?.id) {
      showMessage("error", "Invalid product.");
      return false;
    }

    if (!token) {
      showMessage("error", "Please log in to add items to your cart.");
      return false;
    }

    const authToken = typeof token === "string" ? token.trim() : "";
    const qty = Math.max(1, Math.floor(Number(quantity) || 1));

    try {
      for (let i = 0; i < qty; i++) {
        await axios.post(
          "http://localhost:8080/api/cart/add",
          { productId: product.id },
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
      }

      showMessage(
        "success",
        `Success! ${qty > 1 ? `${qty} ` : ""}${product.name} added to your cart.`
      );
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorMsg = error.response?.data?.message || "Failed to add item to cart.";
      showMessage("error", errorMsg);
      return false;
    }
  };
}
