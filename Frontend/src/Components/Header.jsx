import "./Header.css";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router";
import { useState } from "react";

export function Header({cart}) {
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search');
  const [searchText, setSearchText] = useState(searchFromUrl || "");
  
  const navigate = useNavigate();

  let totalQuantity=0;
  (cart||[] ).forEach((cartItems) => {
    totalQuantity+=cartItems.quantity;
  });

  const handleSearchClick = () => {
    if (searchText) {
      navigate(`/?search=${searchText}`);
    } else {
      navigate(`/`); 
    }
  };

  return (
    <>
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
            placeholder="Search" 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              // Trigger search on Enter
              if (e.key === 'Enter') {
                handleSearchClick();
              } 
              // Clear the input on Escape
              else if (e.key === 'Escape') {
                setSearchText("");
              }
            }}
          />

          <button className="search-button" onClick={handleSearchClick}>
            <img className="search-icon" src="/images/icons/search-icon.png" alt="Search" />
          </button>
        </div>

        <div className="right-section">
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              isActive
                ? "orders-link header-link active"
                : "orders-link header-link"
            }
          >
            <span className="orders-text">Orders</span>
          </NavLink>

          <Link className="cart-link header-link" to="/checkout">
            <img className="cart-icon" src="/images/icons/cart-icon.png" alt="Cart" />
            <div className="cart-quantity">{totalQuantity}</div>
            <div className="cart-text">Cart</div>
          </Link>
        </div>
      </div>
    </>
  );
}