import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Header } from "../../Components/Header";
import { ProductModal } from "../../Components/ProductModal";
import { productsApi, cartApi, extractErrorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { formatMoney } from "../../util/money";
import { getProductImageUrl } from "../../util/imageUrl";
import { toast } from "../../util/toast";
import { SlidersHorizontal, X } from "lucide-react";
import "./CatalogPage.css";

// ── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="product-card skeleton-card" aria-busy="true">
      <div className="skeleton sk-image" />
      <div className="skeleton sk-text sk-title" />
      <div className="skeleton sk-text sk-price" />
      <div className="skeleton sk-text sk-btn" />
    </div>
  );
}

// ── Star Rating ───────────────────────────────────────────────────────────────
function StarRating({ value = 0 }) {
  const stars = Math.round(value * 2) / 2;
  return (
    <div className="star-rating" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={
            s <= Math.floor(stars)
              ? "star full"
              : s - 0.5 === stars
              ? "star half"
              : "star empty"
          }
        >
          ★
        </span>
      ))}
      <span className="rating-value">{value > 0 ? value.toFixed(1) : ""}</span>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, onAddToCart, onOpenModal }) {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const imageSrc = getProductImageUrl(product.image);

  const handleAddToCart = async () => {
    const isAuthenticated = Boolean(user || token || sessionStorage.getItem('token') || localStorage.getItem('token'));

    if (!isAuthenticated) {
      toast.info("Please sign in to add items to your cart");
      navigate("/login", { state: { from: location.pathname } });
      return; // Stop execution immediately
    }

    setAdding(true);
    const success = await onAddToCart(product.id, qty);
    setAdding(false);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    }
  };

  const inStock = (product.stockQuantity ?? 1) > 0;

  return (
    <div className={`product-card${!inStock ? " out-of-stock" : ""}`}>
      {!inStock && <span className="oos-badge">Out of Stock</span>}
      <div
        className="product-image-container"
        onClick={() => onOpenModal?.(product)}
        title="Click to view full details"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onOpenModal?.(product)}
      >
        <img
          className="product-image"
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/150x150?text=Product";
          }}
        />
      </div>

      <div className="product-meta">
        {product.category && (
          <span className="product-category">{product.category.name}</span>
        )}
        {product.brand && <span className="product-brand">{product.brand}</span>}
      </div>

      <div
        className="product-name limit-text-to-2-lines"
        onClick={() => onOpenModal?.(product)}
        title="Click to view full details"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onOpenModal?.(product)}
      >
        {product.name}
      </div>

      <StarRating value={product.rating ?? 0} />

      <div className="product-price">{formatMoney(product.priceCents || 0)}</div>

      <div className="product-card-footer">
        <input
          type="number"
          min="1"
          max={Math.max(1, Math.min(10, product.stockQuantity || 1))}
          className="qty-input"
          value={qty}
          aria-label="Quantity"
          onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
          disabled={!inStock}
        />
        <button
          className={`add-to-cart-button button-primary${added ? " added" : ""}`}
          onClick={handleAddToCart}
          disabled={adding || !inStock}
          aria-label={`Add ${product.name} to cart`}
        >
          {adding ? (
            <span className="btn-spinner-sm" />
          ) : added ? (
            "✓ Added"
          ) : (
            "Add to Cart"
          )}
        </button>
      </div>
    </div>
  );
}

// ── Price Helpers ────────────────────────────────────────────────────────────
const MAX_PRICE_CENTS = 12000;

function formatPriceBadge(cents) {
  if (cents <= 0) return "₹0";
  const rupees = Math.round((Number(cents || 0) / 100) * 52);
  return `₹${rupees.toLocaleString("en-IN")}`;
}

// ── Price Range Slider ────────────────────────────────────────────────────────
function PriceRange({ min, max, onChange }) {
  const [local, setLocal] = useState([min, max]);

  useEffect(() => {
    setLocal([min, max]);
  }, [min, max]);

  const commit = () => onChange(local[0], local[1]);

  return (
    <div className="price-range">
      <div className="price-range-badges">
        <span className="price-badge">{formatPriceBadge(local[0])}</span>
        <span className="price-separator">to</span>
        <span className="price-badge">
          {local[1] >= MAX_PRICE_CENTS
            ? `${formatPriceBadge(MAX_PRICE_CENTS)}+`
            : formatPriceBadge(local[1])}
        </span>
      </div>
      <div className="price-range-inputs">
        <div className="range-slider-group">
          <span className="range-sublabel">Min</span>
          <input
            id="min-price-slider"
            type="range"
            min={0}
            max={MAX_PRICE_CENTS}
            step={250}
            value={local[0]}
            onChange={(e) => {
              const val = Math.min(+e.target.value, local[1] - 250);
              setLocal([val, local[1]]);
            }}
            onMouseUp={commit}
            onTouchEnd={commit}
            aria-label="Minimum price"
            className="range-input"
          />
        </div>
        <div className="range-slider-group">
          <span className="range-sublabel">Max</span>
          <input
            id="max-price-slider"
            type="range"
            min={0}
            max={MAX_PRICE_CENTS}
            step={250}
            value={local[1]}
            onChange={(e) => {
              const val = Math.max(+e.target.value, local[0] + 250);
              setLocal([local[0], val]);
            }}
            onMouseUp={commit}
            onTouchEnd={commit}
            aria-label="Maximum price"
            className="range-input"
          />
        </div>
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ totalPages, currentPage, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i);
  const visible = pages.filter(
    (p) => p === 0 || p === totalPages - 1 || Math.abs(p - currentPage) <= 1
  );

  const items = [];
  visible.forEach((p, i) => {
    const prev = visible[i - 1];
    if (prev !== undefined && p - prev > 1) {
      items.push(
        <span key={`ellipsis-${p}`} className="page-ellipsis" aria-hidden="true">
          …
        </span>
      );
    }
    items.push(
      <button
        key={p}
        type="button"
        className={`page-btn${p === currentPage ? " active" : ""}`}
        onClick={() => onPageChange(p)}
        aria-current={p === currentPage ? "page" : undefined}
        aria-label={`Page ${p + 1}`}
      >
        {p + 1}
      </button>
    );
  });

  return (
    <nav className="pagination" aria-label="Pagination Navigation">
      <button
        type="button"
        className="page-btn page-nav-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        aria-label="Previous page"
      >
        ← Prev
      </button>
      {items}
      <button
        type="button"
        className="page-btn page-nav-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        aria-label="Next page"
      >
        Next →
      </button>
    </nav>
  );
}

// ── Main Catalog Page ─────────────────────────────────────────────────────────
export function CatalogPage({ cart, loadCart }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, isAuthenticated } = useAuth();

  // Derived filter state from URL
  const currentPage = parseInt(searchParams.get("page") || "0", 10);
  const searchQuery = searchParams.get("search") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const brand = searchParams.get("brand") || "";
  const inStockOnly = searchParams.get("inStock") === "true";
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const minPrice = minPriceParam ? parseInt(minPriceParam, 10) || 0 : 0;
  const maxPrice = maxPriceParam ? parseInt(maxPriceParam, 10) || MAX_PRICE_CENTS : MAX_PRICE_CENTS;
  const sort = searchParams.get("sort") || "createdAt,desc";

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Active filters count
  const activeFiltersCount = [
    searchQuery,
    categoryId,
    brand,
    inStockOnly,
    minPrice > 0,
    maxPriceParam && maxPrice < MAX_PRICE_CENTS,
  ].filter(Boolean).length;

  // Close filter drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFilterOpen) {
        setIsFilterOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFilterOpen]);

  // Debounced search
  const searchRef = useRef(searchQuery);
  const debounceTimer = useRef(null);

  const updateParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === "" || value === null || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
      if (key !== "page") {
        next.set("page", "0");
      }
      return next;
    });
  };

  const handlePageChange = (newPage) => {
    updateParam("page", newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    searchRef.current = val;
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateParam("search", val);
    }, 400);
  };

  const handleResetFilters = () => {
    searchRef.current = "";
    const searchInput = document.getElementById("catalog-search");
    if (searchInput) searchInput.value = "";
    const brandInput = document.getElementById("brand-input");
    if (brandInput) brandInput.value = "";
    const catSelect = document.getElementById("category-select");
    if (catSelect) catSelect.value = "";
    setSearchParams({});
  };

  // Load categories once
  useEffect(() => {
    productsApi
      .getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  // Load products on filter/page change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = {
      page: currentPage,
      size: 12,
      sort,
    };
    if (searchQuery && searchQuery.trim()) params.search = searchQuery.trim();
    if (categoryId) params.categoryId = categoryId;
    if (brand && brand.trim()) params.brand = brand.trim();
    if (inStockOnly) params.inStock = true;
    if (minPrice > 0) params.minPriceCents = minPrice;
    if (maxPriceParam && maxPrice < MAX_PRICE_CENTS) params.maxPriceCents = maxPrice;

    productsApi
      .list(params)
      .then((res) => {
        if (cancelled) return;
        const data = res.data;
        // Handle both paginated and array responses
        if (Array.isArray(data)) {
          setProducts(data);
          setTotalPages(1);
          setTotalElements(data.length);
        } else {
          setProducts(data.content || []);
          setTotalPages(data.totalPages || 1);
          setTotalElements(data.totalElements || 0);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load products:", err);
          setProducts([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentPage, searchQuery, categoryId, brand, inStockOnly, minPrice, maxPrice, sort, maxPriceParam]);

  const handleAddToCart = useCallback(
    async (productId, quantity = 1) => {
      const isAuthenticated = Boolean(user || token || sessionStorage.getItem('token') || localStorage.getItem('token'));
      if (!isAuthenticated) {
        toast.info("Please sign in to add items to your cart");
        navigate("/login", { state: { from: location.pathname } });
        return false;
      }
      try {
        await cartApi.add(productId, quantity);
        if (loadCart) await loadCart();
        toast.success("Added to cart!");
        return true;
      } catch (err) {
        const errorMsg =
          extractErrorMessage(err) || "Failed to add item. Please try again.";
        toast.error(errorMsg);
        return false;
      }
    },
    [user, token, loadCart, navigate, location]
  );

  const handleBuyNow = useCallback(
    async (product, quantity = 1) => {
      const isAuthed = Boolean(
        user || token || sessionStorage.getItem("token") || localStorage.getItem("token")
      );
      if (!isAuthed) {
        toast.info("Please sign in to complete your purchase");
        setSelectedProduct(null);
        navigate("/login", { state: { from: "/checkout" } });
        return;
      }
      try {
        await cartApi.add(product.id, quantity);
        if (loadCart) await loadCart();
        setSelectedProduct(null);
        navigate("/checkout");
      } catch (err) {
        const errorMsg =
          extractErrorMessage(err) || "Failed to initiate checkout.";
        toast.error(errorMsg);
      }
    },
    [user, token, loadCart, navigate]
  );

  return (
    <>
      <title>Shop | BISHAL-MART</title>
      <Header cart={cart} />

      <div className="catalog-layout">
        {/* ── Catalog Toolbar ── */}
        <div className="catalog-toolbar">
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className={`filter-toggle-main-btn flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-indigo-300 shadow-sm rounded-xl text-sm font-semibold text-slate-700 hover:text-indigo-600 transition active:scale-95 cursor-pointer ${
              isFilterOpen ? "active ring-2 ring-indigo-500/20 border-indigo-500 text-indigo-600" : ""
            }`}
            aria-expanded={isFilterOpen}
            aria-controls="filter-drawer"
          >
            <SlidersHorizontal size={17} className={isFilterOpen ? "text-indigo-600" : "text-slate-500"} />
            <span>{isFilterOpen ? "Hide Filters" : "Show Filters"}</span>
            {activeFiltersCount > 0 && (
              <span className="filter-count-badge bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <p className="results-count text-sm text-slate-500 font-medium m-0">
            {loading
              ? "Loading products…"
              : `${totalElements || products.length} product${(totalElements || products.length) !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {/* ── Backdrop Overlay when drawer is active ── */}
        <div
          className={`filter-drawer-backdrop fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
            isFilterOpen ? "active opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsFilterOpen(false)}
          aria-hidden="true"
        />

        {/* ── Collapsible Left Slide Drawer ── */}
        <aside
          id="filter-drawer"
          className={`filter-drawer fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out ${
            isFilterOpen ? "open translate-x-0" : "-translate-x-full"
          }`}
          aria-label="Product filters"
        >
          <div className="filter-drawer-header flex items-center justify-between p-5 border-b border-slate-100 bg-white">
            <div className="filter-drawer-title-group flex items-center gap-2.5">
              <SlidersHorizontal size={18} className="filter-drawer-icon text-indigo-600" />
              <h2 className="filter-drawer-title text-base font-bold text-slate-900 m-0">Filters</h2>
              {activeFiltersCount > 0 && (
                <span className="filter-drawer-active-badge text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                  {activeFiltersCount} active
                </span>
              )}
            </div>
            <button
              type="button"
              className="filter-drawer-close-btn p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              onClick={() => setIsFilterOpen(false)}
              aria-label="Close filters drawer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="filter-drawer-body flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {/* Search */}
            <div className="filter-section">
              <label className="filter-label" htmlFor="catalog-search">Search</label>
              <input
                id="catalog-search"
                type="search"
                className="filter-input"
                placeholder="Product name, brand…"
                defaultValue={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            {/* Category */}
            <div className="filter-section">
              <label className="filter-label" htmlFor="category-select">Category</label>
              <select
                id="category-select"
                className="filter-input filter-select"
                value={categoryId}
                onChange={(e) => updateParam("categoryId", e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div className="filter-section">
              <label className="filter-label" htmlFor="brand-input">Brand</label>
              <input
                id="brand-input"
                type="text"
                className="filter-input"
                placeholder="e.g. Apple, Nike"
                defaultValue={brand}
                onChange={(e) => {
                  clearTimeout(debounceTimer.current);
                  debounceTimer.current = setTimeout(
                    () => updateParam("brand", e.target.value),
                    400
                  );
                }}
              />
            </div>

            {/* Price Range */}
            <div className="filter-section">
              <span className="filter-label">Price Range</span>
              <PriceRange
                min={minPrice}
                max={maxPrice}
                onChange={(min, max) => {
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    if (min > 0) next.set("minPrice", String(min));
                    else next.delete("minPrice");

                    if (max < MAX_PRICE_CENTS) next.set("maxPrice", String(max));
                    else next.delete("maxPrice");

                    next.set("page", "0");
                    return next;
                  });
                }}
              />
            </div>

            {/* In Stock */}
            <div className="filter-section filter-toggle-row">
              <div>
                <label className="filter-label" htmlFor="in-stock-toggle">
                  In Stock Only
                </label>
                <span className="filter-hint">Available items only</span>
              </div>
              <button
                id="in-stock-toggle"
                type="button"
                role="switch"
                aria-checked={inStockOnly}
                className={`toggle-switch${inStockOnly ? " on" : ""}`}
                onClick={() => updateParam("inStock", inStockOnly ? "" : "true")}
              >
                <span className="toggle-thumb" />
              </button>
            </div>

            {/* Sort */}
            <div className="filter-section">
              <label className="filter-label" htmlFor="sort-select">Sort By</label>
              <select
                id="sort-select"
                className="filter-input filter-select"
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value)}
              >
                <option value="createdAt,desc">Newest First</option>
                <option value="priceCents,asc">Price: Low → High</option>
                <option value="priceCents,desc">Price: High → Low</option>
                <option value="rating,desc">Top Rated</option>
              </select>
            </div>

            <button
              type="button"
              className="clear-filters-btn"
              onClick={handleResetFilters}
            >
              ✕ Clear All Filters
            </button>
          </div>
        </aside>

        {/* ── Product Grid ── */}
        <main className="catalog-main">

          <div className="products-grid">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
              : products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={handleAddToCart}
                    onOpenModal={setSelectedProduct}
                  />
                ))}
            {!loading && products.length === 0 && (
              <div className="no-results">
                <p>No products match your filters.</p>
                <button
                  className="button-primary"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </main>
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </>
  );
}

export default CatalogPage;
