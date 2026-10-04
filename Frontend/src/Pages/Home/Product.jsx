import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { formatMoney } from "../../util/money";
import { getProductImageUrl } from "../../util/imageUrl";
import { useAuth } from "../../context/AuthContext";
import { toast } from "../../util/toast";
import axios from "axios";

export function Product({ product, loadCart }) {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [showAdded, setShowAdded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const addToCart = async () => {
    const isAuthenticated = Boolean(user || token || sessionStorage.getItem('token') || localStorage.getItem('token'));
    if (!isAuthenticated) {
      toast.info("Please sign in to add items to your cart");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    const finalQuantity = quantity === "" || quantity < 1 ? 1 : quantity;

    try {
      await axios.post("/api/cart", {
        productId: product.id,
        quantity: finalQuantity,
      });

      if (loadCart) {
        await loadCart();
      }
      setShowAdded(true);
      setTimeout(() => {
        setShowAdded(false);
      }, 2500);
    } catch (error) {
      console.error("Failed to add product to cart:", error);
    }
  };

  const imageSrc = getProductImageUrl(product.image);

  return (
    <div className="product-container">
      <div className="product-image-container">
        <img
          className="product-image"
          src={imageSrc}
          alt={product.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/150x150?text=Product";
          }}
        />
      </div>

      <div className="product-name limit-text-to-2-lines">{product.name}</div>

      <div className="product-rating-container">
        <img
          className="product-rating-stars"
          src={`/images/ratings/rating-${Math.round((product.ratingStars || (product.rating?.stars || 0)) * 10)}.png`}
          alt="rating"
        />
        <div className="product-rating-count link-primary">
          {product.ratingCount || product.rating?.count || 0}
        </div>
      </div>

      <div className="product-price">{formatMoney(product.priceCents || 0)}</div>

      <div
        className="product-quantity-container"
        style={{ position: "relative", display: "inline-block" }}
      >
        <input
          type="number"
          min="1"
          max="10"
          value={quantity}
          onChange={(e) => {
            if (e.target.value === "") {
              setQuantity("");
            } else {
              setQuantity(Number(e.target.value));
            }
          }}
          onFocus={(e) => {
            setShowDropdown(true);
            e.target.select();
          }}
          onBlur={() => {
            setTimeout(() => setShowDropdown(false), 150);
          }}
          style={{
            width: "64px",
            padding: "6px 10px",
            boxSizing: "border-box",
            border: showDropdown
              ? "2px solid #6366f1"
              : "1px solid #cbd5e1",
            borderRadius: "8px",
            textAlign: "left",
            outline: "none",
            backgroundColor: "#ffffff",
            fontWeight: "600",
          }}
        />

        {showDropdown && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: "4px",
              width: "64px",
              maxHeight: "180px",
              overflowY: "auto",
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              zIndex: 10,
              padding: "4px 0",
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <div
                key={num}
                onMouseDown={() => {
                  setQuantity(num);
                  setShowDropdown(false);
                }}
                style={{
                  padding: "6px 12px",
                  cursor: "pointer",
                  backgroundColor: quantity === num ? "#6366f1" : "transparent",
                  color: quantity === num ? "#ffffff" : "#0f172a",
                  fontWeight: quantity === num ? "700" : "500",
                  fontSize: "14px",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  if (quantity !== num) {
                    e.target.style.backgroundColor = "#f1f5f9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (quantity !== num) {
                    e.target.style.backgroundColor = "transparent";
                  }
                }}
              >
                {num}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="product-spacer"></div>

      <div
        className="added-to-cart"
        style={{
          opacity: showAdded ? 1 : 0,
          transition: "opacity 0.2s ease-in-out",
        }}
      >
        <img src="/images/icons/checkmark.png" alt="checkmark" />
        Added to Cart
      </div>

      <button className="add-to-cart-button button-primary" onClick={addToCart}>
        Add to Cart
      </button>
    </div>
  );
}

export default Product;