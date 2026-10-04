import { Link } from "react-router";
import { Header } from "../../Components/Header";
import "./OrdersPage.css";
import { ordersApi, cartApi, extractErrorMessage } from "../../services/api";
import { useState, useEffect, Fragment } from "react";
import dayjs from "dayjs";
import { formatMoney } from "../../util/money";
import { getProductImageUrl } from "../../util/imageUrl";
import toast from "react-hot-toast";

// ── Status Badge ──────────────────────────────────────────────────────────────
const STATUS_META = {
  PENDING:    { label: "Pending Payment", cls: "bg-amber-50 text-amber-700 border-amber-200",    icon: "⏳" },
  PAID:       { label: "Paid",            cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "✅" },
  PROCESSING: { label: "Processing",      cls: "bg-blue-50 text-blue-700 border-blue-200",       icon: "⚙️" },
  SHIPPED:    { label: "Shipped",         cls: "bg-indigo-50 text-indigo-700 border-indigo-200",  icon: "🚚" },
  DELIVERED:  { label: "Delivered",       cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "📦" },
  CANCELLED:  { label: "Cancelled",       cls: "bg-rose-50 text-rose-700 border-rose-200",       icon: "✕" },
};

const CANCELLABLE = new Set(["PENDING", "PAID"]);

function StatusBadge({ status }) {
  if (status === "PAID") {
    return (
      <span className="status-badge bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
        <span>✅</span> Paid
      </span>
    );
  }
  if (status === "CANCELLED") {
    return (
      <span className="status-badge bg-rose-50 text-rose-700 border border-rose-200 font-semibold px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
        <span>✕</span> Cancelled
      </span>
    );
  }
  const meta = STATUS_META[status] || { label: status, cls: "bg-amber-50 text-amber-700 border-amber-200", icon: "⏳" };
  return (
    <span className={`status-badge ${meta.cls} border font-semibold px-3 py-1 rounded-full text-xs flex items-center gap-1.5`}>
      <span>{meta.icon}</span> {meta.label}
    </span>
  );
}

// ── Order Skeleton ────────────────────────────────────────────────────────────
function OrderSkeleton() {
  return (
    <div className="order-container skeleton-order bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-6">
      <div className="skeleton sk-text" style={{ width: "40%", height: "18px", marginBottom: "12px" }} />
      <div className="skeleton sk-text" style={{ width: "60%", height: "14px", marginBottom: "8px" }} />
      <div className="skeleton sk-text" style={{ width: "30%", height: "14px" }} />
    </div>
  );
}

// ── Single Order Card ─────────────────────────────────────────────────────────
function OrderCard({ order, onBuyAgain, onCancel }) {
  const [cancelling, setCancelling] = useState(false);
  const canCancel = CANCELLABLE.has(order.status);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      await ordersApi.cancel(order.id);
      toast.success("Order cancelled. Stock has been restored.");
      onCancel();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  // Determine delivery date from first item
  const firstItem = order.products?.[0];
  const deliveryDateMs =
    firstItem?.estimatedDeliveryTimeMs || order.estimatedDeliveryTimeMs;

  return (
    <div className="order-container bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow mb-6 overflow-hidden">
      {/* ── Order Header ── */}
      <div className="order-header bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="order-header-left-section flex items-center gap-6 sm:gap-8 flex-wrap">
          <div className="order-date">
            <div className="order-header-label text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">ORDER PLACED</div>
            <div className="text-sm font-medium text-slate-800">{dayjs(order.orderTimeMs || order.createdAt).format("MMM D, YYYY")}</div>
          </div>
          <div className="order-total">
            <div className="order-header-label text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">TOTAL</div>
            <div className="text-sm font-bold text-slate-900">{formatMoney(order.totalCostCents)}</div>
          </div>
          {order.shippingAddress && (
            <div className="order-shipping-to">
              <div className="order-header-label text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">SHIP TO</div>
              <div className="text-sm text-slate-700 max-w-xs truncate" title={order.shippingAddress}>
                {order.shippingAddress}
              </div>
            </div>
          )}
        </div>

        <div className="order-header-right-section flex items-center gap-3 flex-wrap">
          <div>
            <div className="order-header-label text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">ORDER #</div>
            <div className="order-id text-xs text-slate-600 font-mono">{order.id}</div>
          </div>
          <StatusBadge status={order.status} />
          {canCancel && (
            <button
              className="cancel-order-btn text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition cursor-pointer"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling…" : "Cancel Order"}
            </button>
          )}
        </div>
      </div>

      {/* ── Products ── */}
      <div className="order-details-grid p-6">
        {(order.products || order.items || []).map((orderProduct) => {
          const product = orderProduct.product || {};
          const title = product.name || orderProduct.name || orderProduct.productName || "Product";
          const rawImage = product.image || orderProduct.image || "";
          const imageSrc = getProductImageUrl(rawImage);
          const brand = product.brand || orderProduct.brand;
          const productId = product.id || orderProduct.productId || orderProduct.id;

          const delivMs =
            orderProduct.estimatedDeliveryTimeMs || deliveryDateMs;

          return (
            <Fragment key={productId}>
              <div className="product-image-container flex items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                <img
                  src={imageSrc}
                  alt={title}
                  loading="lazy"
                  className="max-h-28 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/150x150?text=Product";
                  }}
                />
              </div>

              <div className="product-details flex flex-col gap-1.5">
                <div className="product-name font-bold text-slate-900 text-base">{title}</div>
                {brand && (
                  <div className="product-brand-tag text-xs font-semibold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block w-fit">{brand}</div>
                )}
                {delivMs && (
                  <div className={`product-delivery-date text-xs font-medium ${order.status === "DELIVERED" ? "text-emerald-600 font-semibold" : order.status === "CANCELLED" ? "text-slate-400" : "text-slate-600"}`}>
                    {order.status === "DELIVERED"
                      ? `Delivered on ${dayjs(delivMs).format("MMM D, YYYY")}`
                      : order.status === "CANCELLED"
                      ? "Order Cancelled"
                      : `Arriving ${dayjs(delivMs).format("dddd, MMM D")}`}
                  </div>
                )}
                <div className="product-quantity text-xs text-slate-500">Qty: {orderProduct.quantity}</div>
                {orderProduct.priceCents && (
                  <div className="product-unit-price text-sm font-semibold text-slate-800">
                    {formatMoney(orderProduct.priceCents)} each
                  </div>
                )}

                <div className="mt-2">
                  <button
                    className="buy-again-button px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-sm transition flex items-center gap-2 cursor-pointer"
                    onClick={() => onBuyAgain(productId)}
                  >
                    <img
                      className="buy-again-icon w-4 h-4 brightness-0 invert"
                      src="/images/icons/buy-again.png"
                      alt=""
                      aria-hidden="true"
                    />
                    <span>Buy It Again</span>
                  </button>
                </div>
              </div>

              <div className="product-actions flex items-center justify-start sm:justify-end">
                {order.status !== "CANCELLED" && (
                  <Link
                    to={`/tracking/${order.id}/${productId}`}
                  >
                    <button className="track-package-button px-4 py-2 rounded-xl border border-indigo-200 text-indigo-600 bg-indigo-50/40 hover:bg-indigo-50 font-semibold text-sm transition-all cursor-pointer">
                      Track Package
                    </button>
                  </Link>
                )}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Orders Page ──────────────────────────────────────────────────────────
export function OrdersPage({ cart, loadCart }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const response = await ordersApi.list();
      const data = response.data;
      setOrders(Array.isArray(data) ? data : data.content || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleBuyAgain = async (productId) => {
    try {
      await cartApi.add(productId, 1);
      if (loadCart) await loadCart();
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Could not add item to cart.");
    }
  };

  return (
    <>
      <title>Your Orders | BISHAL-MART</title>
      <Header cart={cart} />

      <div className="orders-page">
        <div className="page-title">Your Orders</div>

        {loading ? (
          <div className="orders-grid">
            <OrderSkeleton />
            <OrderSkeleton />
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-orders-container">
            <p className="empty-orders-message">You haven't placed any orders yet.</p>
            <p className="empty-orders-subtext">
              Looking for something to buy? Start adding items to your cart!
            </p>
            <Link to="/" className="button-primary view-products-btn">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onBuyAgain={handleBuyAgain}
                onCancel={loadOrders}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default OrdersPage;