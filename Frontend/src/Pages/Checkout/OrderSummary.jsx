import dayjs from "dayjs";
import { CartItemDetails } from "./CartItemDetails";

export function OrderSummary({ cart = [], deliveryOption = [], loadCart }) {
  return (
    <div className="order-summary">
      {cart.map((cartItem) => {
        // Find selected delivery option by matching IDs
        const selectedDeliveryOption = deliveryOption.find(
          (option) => String(option.id) === String(cartItem.deliveryOptionId)
        );

        // Calculate delivery date dynamically based on deliveryDays
        const daysToAdd = selectedDeliveryOption?.deliveryDays || 7;
        const formattedDeliveryDate = dayjs()
          .add(daysToAdd, "day")
          .format("dddd, MMMM D");

        return (
          <div
            key={cartItem.productId || cartItem.id}
            className="cart-item-container"
          >
            <div className="delivery-date">
              Delivery date: {formattedDeliveryDate}
            </div>

            <CartItemDetails
              loadCart={loadCart}
              cartItem={cartItem}
              deliveryOption={deliveryOption}
            />
          </div>
        );
      })}
    </div>
  );
}

export default OrderSummary;