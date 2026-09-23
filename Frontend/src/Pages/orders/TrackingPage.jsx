import { Link, useParams } from "react-router";
import { Header } from "../../Components/Header";
import "./TrackingPage.css";
import axios from "axios";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { deliveryPercentage } from "../../util/money";

export function TrackingPage({ cart }) {
  const { orderId, productId } = useParams();
  const [trackingData, setTrackingData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const getTrackingDetails = async () => {
      try {
        const response = await axios.get(
          `/api/orders/${orderId}?expand=products`
        );

        const matchedProduct = response.data.products?.find(
          (p) => p.product?.id === productId || p.productId === productId
        );

        if (matchedProduct) {
          setTrackingData({
            order: response.data,
            item: matchedProduct,
          });
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.warn("Order fetch failed:", err);
        setNotFound(true);
      }
    };

    if (orderId && productId) {
      getTrackingDetails();
    }
  }, [orderId, productId]);

  if (notFound) {
    return (
      <>
        <Header cart={cart} />
        <div className="tracking-page">
          <div className="order-tracking">
            <h2>Order Not Found</h2>
            <p>This shipment record is not available.</p>
            <Link className="back-to-orders-link link-primary" to="/orders">
              Return to Orders
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (!trackingData) {
    return (
      <>
        <Header cart={cart} />
        <div className="tracking-page">
          <div className="order-tracking">Loading tracking status...</div>
        </div>
      </>
    );
  }

  const { item, order } = trackingData;
  const product = item.product || {};
  const deliveryPercent = deliveryPercentage({ item, order });

  const display = deliveryPercent >= 100 ? "Delivered on" : "Arriving on";
  const isPreparing = deliveryPercent < 33;
  const isShipped = deliveryPercent >= 33 && deliveryPercent < 100;
  const isDelivered = deliveryPercent >= 100;

  const imageSrc = product.image?.startsWith("/")
    ? product.image
    : `/${product.image || ""}`;

  return (
    <>
      <title>Track Package | BISHAL-MART</title>
      <Header cart={cart} />

      <div className="tracking-page">
        <div className="order-tracking">
          <Link className="back-to-orders-link link-primary" to="/orders">
            ← View all orders
          </Link>

          <div className="delivery-date">
            {display} {dayjs(item.estimatedDeliveryTimeMs).format("dddd, MMMM D")}
          </div>

          <div className="product-name-info">{product.name}</div>
          <div className="product-quantity-info">Quantity: {item.quantity}</div>

          <img
            className="product-image-preview"
            src={imageSrc}
            alt={product.name}
          />

          <div className="progress-section">
            <div className="progress-labels-container">
              <div className={`progress-label ${isPreparing ? "current-status" : ""}`}>
                Preparing
              </div>
              <div className={`progress-label ${isShipped ? "current-status" : ""}`}>
                Shipped
              </div>
              <div className={`progress-label ${isDelivered ? "current-status" : ""}`}>
                Delivered
              </div>
            </div>

            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${deliveryPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TrackingPage;