import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  Star,
  ShoppingCart,
  Zap,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { getProductImageUrl } from "../util/imageUrl";
import { useAuth } from "../context/AuthContext";
import { toast } from "../util/toast";
import "./ProductModal.css";

export function ProductModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
}) {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);

  // Reset quantity whenever a new product is selected
  useEffect(() => {
    setQty(1);
    setAdding(false);
    setBuying(false);
  }, [product?.id]);

  // Handle Escape key and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const stock = typeof product.stockQuantity === "number" ? product.stockQuantity : 10;
  const isOutOfStock = stock <= 0;
  const maxAllowedQty = Math.max(1, Math.min(10, stock));

  const imageSrc = getProductImageUrl(product.image);

  // Robust rating calculator - completely prevents NaN
  const getRatingValue = () => {
    if (!product) return "4.5";
    if (typeof product.rating === "number" && !isNaN(product.rating)) {
      return product.rating.toFixed(1);
    }
    if (typeof product.ratingStars === "number" && !isNaN(product.ratingStars)) {
      return product.ratingStars.toFixed(1);
    }
    if (product.rating && typeof product.rating.stars === "number" && !isNaN(product.rating.stars)) {
      return product.rating.stars.toFixed(1);
    }
    if (typeof product.rating === "string" && !isNaN(parseFloat(product.rating))) {
      return parseFloat(product.rating).toFixed(1);
    }
    return "4.5";
  };

  const formattedPrice = `₹${(((product.priceCents || 0) / 100)).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const handleAdd = async () => {
    const isAuthenticated = Boolean(
      user ||
        token ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("token")
    );

    if (!isAuthenticated) {
      toast.info("Please sign in to add items to your cart");
      onClose();
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (isOutOfStock) return;

    setAdding(true);
    if (onAddToCart) {
      await onAddToCart(product.id, qty);
    }
    setAdding(false);
  };

  const handleBuy = async () => {
    const isAuthenticated = Boolean(
      user ||
        token ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("token")
    );

    if (!isAuthenticated) {
      toast.info("Please sign in to complete your purchase");
      onClose();
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    if (isOutOfStock) return;

    setBuying(true);
    if (onBuyNow) {
      await onBuyNow(product, qty);
    }
    setBuying(false);
  };

  return (
    <div
      className="product-modal-backdrop fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div
        className="product-modal-card bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-100 p-6 md:p-8 max-w-4xl w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Close Button */}
        <button
          type="button"
          className="product-modal-close-btn text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full absolute top-4 right-4 transition cursor-pointer"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="product-modal-content">
          {/* Left Column: Product Image Showcase */}
          <div className="product-modal-image-col">
            <div className="product-modal-image-wrapper bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-center justify-center">
              <img
                className="product-modal-image max-h-80 object-contain"
                src={imageSrc}
                alt={product.name}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/300x300?text=Product";
                }}
              />
              {isOutOfStock && (
                <span className="product-modal-oos-badge">Out of Stock</span>
              )}
            </div>

            {/* Trust Badges */}
            <div className="product-modal-perks-row w-full flex items-center justify-around bg-slate-50 border border-slate-100 rounded-xl p-2.5">
              <div className="product-modal-perk-item flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Truck size={14} className="text-indigo-600" />
                <span>Fast Delivery</span>
              </div>
              <div className="product-modal-perk-item flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <ShieldCheck size={14} className="text-indigo-600" />
                <span>Genuine Product</span>
              </div>
              <div className="product-modal-perk-item flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <RotateCcw size={14} className="text-indigo-600" />
                <span>7-Day Return</span>
              </div>
            </div>
          </div>

          {/* Right Column: Metadata & Actions */}
          <div className="product-modal-details-col">
            <div className="product-modal-meta-row flex items-center justify-between gap-3">
              <span className="product-modal-brand-badge text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md inline-block">
                {product.brand || product.category?.name || "Bishal-Mart"}
              </span>
              <div className="product-modal-verified-tag flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <CheckCircle2 size={14} />
                <span>Verified Seller</span>
              </div>
            </div>

            <h2 id="product-modal-title" className="product-modal-title text-xl md:text-2xl font-bold text-slate-900 mt-2">
              {product.name}
            </h2>

            {/* Ratings */}
            <div className="product-modal-rating-row flex items-center gap-2.5">
              <div className="product-modal-rating-pill inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                <Star className="product-modal-rating-star w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                <span>{getRatingValue()}</span>
              </div>
              <span className="product-modal-reviews-count text-xs text-slate-500">
                ({product.ratingCount || 128} customer reviews)
              </span>
            </div>

            {/* Price Box */}
            <div className="product-modal-price-box bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-baseline gap-2.5">
              <span className="product-modal-current-price text-2xl font-extrabold text-slate-900">
                {formattedPrice}
              </span>
              <span className="product-modal-tax-note text-xs text-slate-500">
                Inclusive of all taxes
              </span>
            </div>

            {/* Stock Quantity Indicator */}
            <div className="product-modal-stock-row">
              {stock > 5 ? (
                <div className="product-modal-stock-badge in-stock bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 mt-1">
                  <CheckCircle2 size={16} />
                  <span>In Stock ({stock} items available)</span>
                </div>
              ) : stock > 0 ? (
                <div className="product-modal-stock-badge low-stock bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 mt-1">
                  <AlertCircle size={16} />
                  <span>Hurry! Only {stock} left in stock</span>
                </div>
              ) : (
                <div className="product-modal-stock-badge out-of-stock bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 mt-1">
                  <AlertCircle size={16} />
                  <span>Out of Stock</span>
                </div>
              )}
            </div>

            {/* Quantity Stepper */}
            {!isOutOfStock && (
              <div className="product-modal-qty-row flex items-center gap-3">
                <span className="product-modal-qty-label text-xs font-semibold text-slate-600">Quantity:</span>
                <div className="product-modal-qty-stepper border border-slate-200 rounded-xl bg-slate-50 text-slate-700 inline-flex items-center overflow-hidden">
                  <button
                    type="button"
                    className="product-modal-qty-btn px-3 py-1 hover:bg-slate-200 transition font-bold text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                    disabled={qty <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="product-modal-qty-val px-2.5 font-bold text-sm text-slate-800">{qty}</span>
                  <button
                    type="button"
                    className="product-modal-qty-btn px-3 py-1 hover:bg-slate-200 transition font-bold text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() =>
                      setQty((prev) => Math.min(maxAllowedQty, prev + 1))
                    }
                    disabled={qty >= maxAllowedQty}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Keywords / Tags */}
            {product.keywords && product.keywords.length > 0 && (
              <div className="product-modal-tags flex flex-wrap gap-1.5">
                {product.keywords.map((kw, idx) => (
                  <span key={idx} className="product-modal-tag-chip bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-lg">
                    #{kw}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="product-modal-actions-row flex gap-3 mt-2">
              <button
                type="button"
                onClick={handleAdd}
                disabled={isOutOfStock || adding}
                className="product-modal-add-cart-btn flex-1 py-3 px-5 rounded-xl border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
                aria-label={`Add ${product.name} to cart`}
              >
                <ShoppingCart size={18} />
                <span>{adding ? "Adding…" : "Add to Cart"}</span>
              </button>

              <button
                type="button"
                onClick={handleBuy}
                disabled={isOutOfStock || buying}
                className="product-modal-buy-now-btn flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-5 rounded-xl shadow-md shadow-indigo-500/20 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
                aria-label={`Buy ${product.name} now`}
              >
                <Zap size={18} />
                <span>{buying ? "Processing…" : "Buy Now"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
