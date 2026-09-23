import { Link } from "react-router";
import "./checkout-header.css";

export function CheckoutHeader({ cart = [] }) {
  const safeCart = Array.isArray(cart) ? cart : [];
  
  const totalQuantity = safeCart.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  return (
    <div className="checkout-header">
      <div className="header-content">
        <div className="checkout-header-left-section">
          <Link to="/">
            <div className="BishalSection">BISHAL-MART</div>
          </Link>
        </div>

        <div className="checkout-header-middle-section">
          Checkout (
          <Link className="return-to-home-link" to="/">
            {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
          </Link>
          )
        </div>

        <div className="checkout-header-right-section">
          <img src="/images/icons/checkout-lock-icon.png" alt="Checkout Lock" />
        </div>
      </div>
    </div>
  );
}

export default CheckoutHeader;