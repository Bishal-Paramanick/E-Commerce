import axios from "axios";
import { formatMoney } from "../../util/money";
import { useNavigate } from "react-router";
import { useState } from "react";
import "./PaymentSummary.css";

export function PaymentSummary({
  paymentSummary,
  cart = [],
  deliveryOptions = [],
  deliveryOption = [],
  loadCart,
}) {
  const navigate = useNavigate();
  const [orderState, setOrderState] = useState("idle"); // "idle" | "loading" | "success"

  const optionsList =
    deliveryOptions.length > 0 ? deliveryOptions : deliveryOption;

  let totalItems = 0;
  let productCostCents = 0;
  let shippingCostCents = 0;

  cart.forEach((cartItem) => {
    const qty = cartItem.quantity || 1;
    totalItems += qty;

    const itemPrice =
      cartItem.product?.priceCents || cartItem.priceCents || 0;
    productCostCents += itemPrice * qty;

    const selectedOption = optionsList.find(
      (opt) => String(opt.id) === String(cartItem.deliveryOptionId)
    );

    if (selectedOption) {
      shippingCostCents += selectedOption.priceCents || 0;
    }
  });

  const totalCostBeforeTaxCents = productCostCents + shippingCostCents;
  const taxCents = Math.round(totalCostBeforeTaxCents * 0.1);
  const totalCostCents = totalCostBeforeTaxCents + taxCents;

  const summary = paymentSummary || {
    totalItems,
    productCostCents,
    shippingCostCents,
    totalCostBeforeTaxCents,
    taxCents,
    totalCostCents,
  };

  const createOrder = async () => {
    // 1. Immediately trigger the full-screen round loading overlay
    setOrderState("loading");

    try {
      // 2. Submit order to the backend
      await axios.post("/api/orders", {
        orderTimeMs: Date.now(),
        totalCostCents: summary.totalCostCents,
      });

      // 3. Keep the round spinner visible for 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 4. Switch to the success message with animated green checkmark
      setOrderState("success");

      // 5. Keep the success tick on screen for 1.8 seconds
      await new Promise((resolve) => setTimeout(resolve, 1800));

      // 6. Reload cart state
      if (loadCart) {
        await loadCart();
      }

      // 7. Route directly to the orders page
      navigate("/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to place order. Please try again.");
      setOrderState("idle");
    }
  };

  return (
    <>
      {/* FULL-SCREEN OVERLAY TRANSITION */}
      {orderState !== "idle" && (
        <div className="order-overlay">
          <div className="order-overlay-card">
            {orderState === "loading" && (
              <>
                <div className="order-spinner"></div>
                <h3 className="overlay-heading">Processing Order...</h3>
                <p className="overlay-subtext">Securing your items and confirming payment</p>
              </>
            )}

            {orderState === "success" && (
              <>
                <div className="order-success-icon-wrapper">
                  <svg
                    className="checkmark-svg"
                    viewBox="0 0 52 52"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="checkmark-circle"
                      cx="26"
                      cy="26"
                      r="25"
                      fill="none"
                    />
                    <path
                      className="checkmark-check"
                      fill="none"
                      d="M14.1 27.2l7.1 7.2 16.7-16.8"
                    />
                  </svg>
                </div>
                <h3 className="overlay-heading success">Order Placed Successfully!</h3>
                <p className="overlay-subtext">Redirecting to your orders page...</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* PAYMENT SUMMARY BOX */}
      <div className="payment-summary">
        <div className="payment-summary-title">Payment Summary</div>

        <div className="payment-summary-row">
          <div>Items ({summary.totalItems}):</div>
          <div className="payment-summary-money">
            {formatMoney(summary.productCostCents)}
          </div>
        </div>

        <div className="payment-summary-row">
          <div>Shipping &amp; handling:</div>
          <div className="payment-summary-money">
            {formatMoney(summary.shippingCostCents)}
          </div>
        </div>

        <div className="payment-summary-row subtotal-row">
          <div>Total before tax:</div>
          <div className="payment-summary-money">
            {formatMoney(summary.totalCostBeforeTaxCents)}
          </div>
        </div>

        <div className="payment-summary-row">
          <div>Estimated tax (10%):</div>
          <div className="payment-summary-money">
            {formatMoney(summary.taxCents)}
          </div>
        </div>

        <div className="payment-summary-row total-row">
          <div>Order total:</div>
          <div className="payment-summary-money">
            {formatMoney(summary.totalCostCents)}
          </div>
        </div>

        <button
          className="place-order-button button-primary"
          onClick={createOrder}
          disabled={orderState !== "idle" || summary.totalItems === 0}
        >
          Place your order
        </button>
      </div>
    </>
  );
}

export default PaymentSummary;