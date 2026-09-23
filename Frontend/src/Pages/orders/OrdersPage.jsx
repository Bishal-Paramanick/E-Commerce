import { Link } from "react-router";
import { Header } from "../../Components/Header";
import "./OrdersPage.css";
import axios from "axios";
import { useState, useEffect, Fragment } from "react";
import dayjs from "dayjs";
import { formatMoney } from "../../util/money";

export function OrdersPage({ cart, loadCart }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const getOrdersData = async () => {
      try {
        const response = await axios.get("/api/orders?expand=products");
        setOrders(response.data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    getOrdersData();
  }, []);

  const handleBuyAgain = async (productId) => {
    try {
      // Updated endpoint: /api/cart
      await axios.post("/api/cart", {
        productId: productId,
        quantity: 1,
      });

      if (loadCart) {
        await loadCart();
      }
      alert("Added to cart!");
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  const isOrdersEmpty = !orders || orders.length === 0;

  return (
    <>
      <title>OrdersPage</title>
      <Header cart={cart} />

      <div className="orders-page">
        <div className="page-title">Your Orders</div>

        {isOrdersEmpty ? (
          <div className="empty-orders-container">
            <p className="empty-orders-message">
              You haven't placed any orders yet.
            </p>
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
              <div key={order.id} className="order-container">
                <div className="order-header">
                  <div className="order-header-left-section">
                    <div className="order-date">
                      <div className="order-header-label">Order Placed:</div>
                      <div>{dayjs(order.orderTimeMs).format("MMMM D")}</div>
                    </div>
                    <div className="order-total">
                      <div className="order-header-label">Total:</div>
                      <div>{formatMoney(order.totalCostCents)}</div>
                    </div>
                  </div>

                  <div className="order-header-right-section">
                    <div className="order-header-label">Order ID:</div>
                    <div>{order.id}</div>
                  </div>
                </div>

                <div className="order-details-grid">
                  {order.products?.map((orderProduct) => {
                    const product = orderProduct.product || {};
                    const imageSrc = product.image?.startsWith("/")
                      ? product.image
                      : `/${product.image || ""}`;

                    return (
                      <Fragment key={product.id || orderProduct.productId}>
                        <div className="product-image-container">
                          <img src={imageSrc} alt={product.name || "Product"} />
                        </div>

                        <div className="product-details">
                          <div className="product-name">
                            {product.name}
                          </div>
                          <div className="product-delivery-date">
                            Arriving on:{" "}
                            {dayjs(orderProduct.estimatedDeliveryTimeMs).format(
                              "MMMM D",
                            )}
                          </div>
                          <div className="product-quantity">
                            Quantity: {orderProduct.quantity}
                          </div>

                          <button
                            className="buy-again-button button-primary"
                            onClick={() =>
                              handleBuyAgain(product.id || orderProduct.productId)
                            }
                          >
                            <img
                              className="buy-again-icon"
                              src="/images/icons/buy-again.png"
                              alt="Buy again"
                            />
                            <span className="buy-again-message">Buy it again</span>
                          </button>
                        </div>

                        <div className="product-actions">
                          <Link
                            to={`/tracking/${order.id}/${product.id || orderProduct.productId}`}
                          >
                            <button className="track-package-button button-secondary">
                              Track package
                            </button>
                          </Link>
                        </div>
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default OrdersPage;