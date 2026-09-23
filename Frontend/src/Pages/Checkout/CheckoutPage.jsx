import { useEffect, useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import { CheckoutHeader } from "./CheckoutHeader";
import { OrderSummary } from "./OrderSummary";
import { PaymentSummary } from "./PaymentSummary";
import "./CheckoutPage.css";

export function CheckoutPage({ cart = [], loadCart }) {
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveryOptions = async () => {
      try {
        const res = await axios.get("/api/delivery-options");
        setDeliveryOptions(res.data || []);
      } catch (err) {
        console.error("Failed to load delivery options:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryOptions();
  }, []);

  const isCartEmpty = !cart || cart.length === 0;

  if (loading) {
    return (
      <>
        <CheckoutHeader cart={cart} />
        <div className="checkout-page">
          <div className="empty-cart-container">
            <p className="empty-cart-message">Loading checkout details...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CheckoutHeader cart={cart} />

      <div className="checkout-page">
        {!isCartEmpty && (
          <div className="page-title">Review your order</div>
        )}

        <div className="checkout-grid">
          {isCartEmpty ? (
            <div className="empty-cart-container">
              <p className="empty-cart-message">Your cart is currently empty.</p>
              <p className="empty-cart-subtext">
                Explore our catalog to find items you want to order.
              </p>
              <Link to="/" className="button-primary view-products-btn">
                Explore Products
              </Link>
            </div>
          ) : (
            <>
              <OrderSummary
                cart={cart}
                deliveryOption={deliveryOptions}
                loadCart={loadCart}
              />
              <PaymentSummary
                cart={cart}
                deliveryOptions={deliveryOptions}
                loadCart={loadCart}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default CheckoutPage;