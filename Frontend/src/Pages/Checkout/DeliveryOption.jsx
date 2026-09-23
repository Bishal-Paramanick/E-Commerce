import dayjs from "dayjs";
import { formatMoney } from "../../util/money";
import axios from "axios";

export function DeliveryOption({ deliveryOption = [], cartItem, loadCart }) {
  const productId = cartItem.productId || cartItem.product?.id;

  return (
    <div className="delivery-options">
      <div className="delivery-options-title">Choose a delivery option:</div>
      {deliveryOption.map((option) => {
        const priceString =
          option.priceCents === 0
            ? "FREE Shipping"
            : `${formatMoney(option.priceCents)} - Shipping`;

        const deliveryDate = dayjs()
          .add(option.deliveryDays || 7, "day")
          .format("dddd, MMMM D");

        const updateDeliveryOption = async () => {
          try {
            await axios.put(`/api/cart/${productId}`, {
              deliveryOptionId: option.id,
            });
            if (loadCart) {
              await loadCart();
            }
          } catch (error) {
            console.error("Error updating delivery option:", error);
          }
        };

        const isChecked = String(option.id) === String(cartItem.deliveryOptionId);

        return (
          <div
            key={option.id}
            className="delivery-option"
            onClick={updateDeliveryOption}
          >
            <input
              type="radio"
              checked={isChecked}
              onChange={() => {}}
              className="delivery-option-input"
              name={`delivery-option-${productId}`}
            />
            <div>
              <div className="delivery-option-date">{deliveryDate}</div>
              <div className="delivery-option-price">{priceString}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DeliveryOption;