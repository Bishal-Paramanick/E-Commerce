import "./Header.css";
import { Link, NavLink, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "../util/toast";

export function Header({ cart }) {
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get("search");
  const [searchText, setSearchText] = useState(searchFromUrl || "");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuth();
  const isAuthenticated = Boolean(user || token || sessionStorage.getItem('token') || localStorage.getItem('token'));

  let totalQuantity = 0;
  (cart || []).forEach((cartItem) => {
    totalQuantity += cartItem.quantity;
  });

  const handleSearchClick = () => {
    if (searchText) {
      navigate(`/?search=${encodeURIComponent(searchText)}`);
    } else {
      navigate(`/`);
    }
  };

  const handleOrdersNavigation = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("Please sign in to view your orders");
      navigate("/login", { state: { from: "/orders" } });
      return;
    }
    navigate("/orders");
  };

  const handleCartNavigation = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("Please sign in to view your cart");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    navigate("/cart");
  };

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    toast.success("Signed out successfully. See you soon!", {
      icon: "👋",
      duration: 2500,
    });
    document.body.classList.add("auth-signout-fade");
    setTimeout(() => {
      logout();
      document.body.classList.remove("auth-signout-fade");
      setLoggingOut(false);
      navigate("/");
    }, 700);
  };

  return (
    <div className="header">
      <div className="left-section">
        <NavLink to="/" className="header-link">
          <div className="BishalSection">BISHAL-MART</div>
        </NavLink>
      </div>

      <div className="middle-section">
        <input
          className="search-bar"
          type="text"
          placeholder="Search products, brands…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearchClick();
            else if (e.key === "Escape") setSearchText("");
          }}
          aria-label="Search products"
        />
        <button
          className="search-button"
          onClick={handleSearchClick}
          aria-label="Submit search"
        >
          <img className="search-icon" src="/images/icons/search-icon.png" alt="" aria-hidden="true" />
        </button>
      </div>

      <div className="right-section">
        <button
          type="button"
          className="orders-btn orders-link header-nav-action-btn"
          onClick={handleOrdersNavigation}
          aria-label="View orders"
        >
          <svg
            className="orders-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span className="orders-text">Orders</span>
        </button>

        {isAuthenticated ? (
          <>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive ? "header-link profile-link active" : "header-link profile-link"
              }
            >
              <span className="user-avatar-badge">
                {(user?.username?.[0] || "U").toUpperCase()}
              </span>
              <span className="nav-text">{user?.username}</span>
            </NavLink>

            <button
              className="header-logout-btn"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "Signing out…" : "Sign Out"}
            </button>
          </>
        ) : (
          <NavLink
            to="/login"
            state={{ from: location.pathname }}
            className="header-signin-btn"
          >
            Sign In
          </NavLink>
        )}

        <button
          type="button"
          className="cart-link header-link header-nav-action-btn"
          onClick={handleCartNavigation}
          aria-label="View cart"
        >
          <img className="cart-icon" src="/images/icons/cart-icon.png" alt="Cart" />
          <div className="cart-quantity">{totalQuantity}</div>
          <div className="cart-text">Cart</div>
        </button>
      </div>
    </div>
  );
}