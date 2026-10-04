import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckoutHeader } from "./CheckoutHeader";
import { CartItemDetails } from "./CartItemDetails";
import { ordersApi, paymentsApi, userApi, deliveryApi, extractErrorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { formatMoney } from "../../util/money";
import { toast } from "../../util/toast";
import "./CheckoutPage.css";
import "./PaymentSummary.css";

// ── Load Razorpay SDK lazily ──────────────────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

if (import.meta.env.DEV && !import.meta.env.VITE_RAZORPAY_KEY_ID) {
  console.warn(
    "[Razorpay Warning] VITE_RAZORPAY_KEY_ID is missing from environment variables. " +
    "Checkout modal initialization will fail. Please verify VITE_RAZORPAY_KEY_ID in .env.local."
  );
}

// ── Address Selector ──────────────────────────────────────────────────────────
function AddressSelector({ addresses, selectedId, onSelect, customAddress, onCustomChange }) {
  const [mode, setMode] = useState(selectedId ? "saved" : addresses.length > 0 ? "saved" : "custom");

  return (
    <div className="address-selector">
      <h3 className="section-subtitle">Shipping Address</h3>

      <div className="addr-mode-tabs">
        {addresses.length > 0 && (
          <button
            className={`addr-tab${mode === "saved" ? " active" : ""}`}
            onClick={() => setMode("saved")}
          >
            Saved Addresses
          </button>
        )}
        <button
          className={`addr-tab${mode === "custom" ? " active" : ""}`}
          onClick={() => setMode("custom")}
        >
          Enter Manually
        </button>
      </div>

      {mode === "saved" && addresses.length > 0 && (
        <div className="saved-addr-list">
          {addresses.map((addr) => (
            <label
              key={addr.id}
              className={`saved-addr-option${selectedId === addr.id ? " selected" : ""}`}
            >
              <input
                type="radio"
                name="checkout-address"
                value={addr.id}
                checked={selectedId === addr.id}
                onChange={() => onSelect(addr.id)}
              />
              <div className="addr-option-details">
                <strong>{addr.fullName}</strong>
                {addr.isDefault && <span className="mini-default-badge">Default</span>}
                <span>
                  {addr.streetAddress}, {addr.city}, {addr.state} – {addr.postalCode}
                </span>
                <span>📞 {addr.phone}</span>
              </div>
            </label>
          ))}
        </div>
      )}

      {mode === "custom" && (
        <textarea
          className="custom-addr-input"
          rows={3}
          placeholder="Full shipping address (name, street, city, state, pincode, phone)"
          value={customAddress}
          onChange={(e) => onCustomChange(e.target.value)}
        />
      )}
    </div>
  );
}

// ── Order Overlay ─────────────────────────────────────────────────────────────
function OrderOverlay({ state }) {
  if (state === "idle") return null;
  return (
    <div className="order-overlay">
      <div className="order-overlay-card">
        {state === "loading" && (
          <>
            <div className="order-spinner" />
            <h3 className="overlay-heading">Processing Order…</h3>
            <p className="overlay-subtext">Securing your items and initializing payment</p>
          </>
        )}
        {state === "success" && (
          <>
            <div className="order-success-icon-wrapper">
              <svg className="checkmark-svg" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h3 className="overlay-heading success">Payment Verified!</h3>
            <p className="overlay-subtext">Redirecting to your orders…</p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Payment Summary Panel ─────────────────────────────────────────────────────
function PaymentPanel({
  cart,
  deliveryOptions,
  addresses,
  selectedAddressId,
  customAddress,
  loadCart,
}) {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [orderState, setOrderState] = useState("idle");
  const setIsProcessing = (val) => setOrderState(val ? "loading" : "idle");

  let totalItems = 0;
  let productCostCents = 0;
  let shippingCostCents = 0;

  cart.forEach((cartItem) => {
    const qty = cartItem.quantity || 1;
    totalItems += qty;
    const itemPrice = cartItem.product?.priceCents || cartItem.priceCents || 0;
    productCostCents += itemPrice * qty;

    const selectedOption = deliveryOptions.find(
      (opt) => String(opt.id) === String(cartItem.deliveryOptionId)
    );
    if (selectedOption) shippingCostCents += selectedOption.priceCents || 0;
  });

  const totalBeforeTax = productCostCents + shippingCostCents;
  const taxCents = Math.round(totalBeforeTax * 0.1);
  const totalCostCents = totalBeforeTax + taxCents;

  const handlePaymentSuccess = async (response, orderId) => {
    try {
      // 4. Verify payment
      await paymentsApi.verify({
        orderId: orderId,
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });
      setOrderState("success");
      if (loadCart) await loadCart();
      setTimeout(() => navigate("/orders"), 1800);
    } catch (verifyErr) {
      console.error("Payment verification failed:", verifyErr);
      toast.error(extractErrorMessage(verifyErr) || "Payment verification failed. Our team has been notified.");
      setIsProcessing(false);
      throw verifyErr;
    }
  };

  const handlePlaceOrder = async () => {
    const hasAddress = selectedAddressId || customAddress.trim();
    if (!hasAddress) {
      toast.error("Please select or enter a shipping address.");
      return;
    }

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      console.error("VITE_RAZORPAY_KEY_ID is missing from the environment variables!");
      toast.error("Payment configuration missing. Please verify VITE_RAZORPAY_KEY_ID in .env.local.");
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Checkout → get Razorpay paymentOrderId
      const payload = {};
      if (selectedAddressId) {
        payload.addressId = selectedAddressId;
      } else {
        payload.shippingAddress = customAddress;
      }
      const checkoutRes = await ordersApi.checkout(payload);
      const orderData = checkoutRes.data;

      // 2. Load Razorpay
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        toast.error("Failed to load payment SDK. Please try again.");
        setIsProcessing(false);
        return;
      }

      // Defensive validation check before creating new window.Razorpay
      if (!razorpayKey) {
        console.error("VITE_RAZORPAY_KEY_ID is missing from the environment variables!");
        toast.error("Payment configuration missing. Please verify VITE_RAZORPAY_KEY_ID in .env.local.");
        setIsProcessing(false);
        return;
      }

      // 3. Open Razorpay modal
      await new Promise((resolve, reject) => {
        console.log("Initiating Razorpay payment:", {
          orderId: orderData.id,
          paymentOrderId: orderData.paymentOrderId,
          totalCostCents: orderData.totalCostCents,
          displayTotalRupees: (orderData.totalCostCents / 100).toFixed(2)
        });

        // Ensure options.amount is strictly the total payable in paise/cents:
        const options = {
          key: razorpayKey, // Must be string starting with rzp_test_ or rzp_live_
          amount: orderData.totalCostCents, // MUST be totalCostCents (total including products, shipping, and tax)
          currency: "INR",
          name: "Bishal-Mart",
          description: `Order #${orderData.id}`,
          order_id: orderData.paymentOrderId, // Order ID created by backend via Razorpay Orders API
          prefill: {
            name: user?.username || profile?.username || "",
            email: user?.email || profile?.email || "",
          },
          theme: {
            color: "#6366f1", // Match primary theme
          },
          handler: async function (response) {
            // Proceed to /api/payments/verify
            try {
              await handlePaymentSuccess(response, orderData.id);
              resolve(response);
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              toast.info("Payment window closed.");
              reject(new Error("dismissed"));
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          console.error("Payment failed:", response.error);
          toast.error(response.error?.description || response.error?.message || "Payment failed.");
          setIsProcessing(false);
          reject(response.error || response);
        });
        rzp.open();
      });
    } catch (err) {
      if (err?.message !== "dismissed") {
        console.error("Checkout error:", err);
        toast.error(extractErrorMessage(err) || "Failed to place order. Please try again.");
        setIsProcessing(false);
      }
    }
  };

  return (
    <>
      <OrderOverlay state={orderState} />

      <div className="payment-summary">
        <div className="payment-summary-title">Payment Summary</div>

        <div className="payment-summary-row">
          <div>Items ({totalItems}):</div>
          <div className="payment-summary-money">{formatMoney(productCostCents)}</div>
        </div>
        <div className="payment-summary-row">
          <div>Shipping &amp; handling:</div>
          <div className="payment-summary-money">{formatMoney(shippingCostCents)}</div>
        </div>
        <div className="payment-summary-row subtotal-row">
          <div>Total before tax:</div>
          <div className="payment-summary-money">{formatMoney(totalBeforeTax)}</div>
        </div>
        <div className="payment-summary-row">
          <div>Estimated tax (10%):</div>
          <div className="payment-summary-money">{formatMoney(taxCents)}</div>
        </div>
        <div className="payment-summary-row total-row">
          <div>Order total:</div>
          <div className="payment-summary-money">{formatMoney(totalCostCents)}</div>
        </div>

        <button
          className="place-order-button w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-500/25 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          onClick={handlePlaceOrder}
          disabled={orderState !== "idle" || totalItems === 0}
        >
          {orderState === "loading" ? (
            <><span className="btn-spinner-sm" /> Processing…</>
          ) : (
            "Place Order & Pay"
          )}
        </button>
      </div>
    </>
  );
}

// ── Main Checkout Page ────────────────────────────────────────────────────────
export function CheckoutPage({ cart = [], loadCart }) {
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [customAddress, setCustomAddress] = useState("");
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const init = async () => {
      try {
        const [delivRes] = await Promise.allSettled([deliveryApi.list()]);
        if (delivRes.status === "fulfilled") setDeliveryOptions(delivRes.value.data || []);

        if (isAuthenticated) {
          const addrRes = await userApi.getAddresses();
          const addrList = addrRes.data || [];
          setAddresses(addrList);
          const def = addrList.find((a) => a.isDefault);
          if (def) setSelectedAddressId(def.id);
        }
      } catch (err) {
        console.error("Checkout init error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [isAuthenticated]);

  const isCartEmpty = !cart || cart.length === 0;

  if (loading) {
    return (
      <>
        <CheckoutHeader cart={cart} />
        <div className="checkout-page">
          <div className="empty-cart-container">
            <p className="empty-cart-message">Loading checkout…</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CheckoutHeader cart={cart} />
      <div className="checkout-page">
        {!isCartEmpty && <div className="page-title">Review your order</div>}

        <div className="checkout-grid">
          {isCartEmpty ? (
            <div className="empty-cart-container">
              <p className="empty-cart-message">Your cart is currently empty.</p>
              <p className="empty-cart-subtext">Explore our catalog to find items you want to order.</p>
              <Link to="/" className="button-primary view-products-btn">Explore Products</Link>
            </div>
          ) : (
            <>
              <div className="checkout-left">
                {/* Address Selector */}
                <AddressSelector
                  addresses={addresses}
                  selectedId={selectedAddressId}
                  onSelect={setSelectedAddressId}
                  customAddress={customAddress}
                  onCustomChange={setCustomAddress}
                />

                {/* Cart Items */}
                <div className="cart-items-section">
                  <h3 className="section-subtitle" style={{ marginBottom: "16px" }}>Order Items</h3>
                  {cart.map((cartItem) => (
                    <CartItemDetails
                      key={cartItem.productId || cartItem.id}
                      cartItem={cartItem}
                      deliveryOption={deliveryOptions}
                      loadCart={loadCart}
                    />
                  ))}
                </div>
              </div>

              <PaymentPanel
                cart={cart}
                deliveryOptions={deliveryOptions}
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                customAddress={customAddress}
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