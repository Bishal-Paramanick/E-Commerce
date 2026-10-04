import { cartApi } from "../../services/api";
import { formatMoney } from "../../util/money";
import { getProductImageUrl } from "../../util/imageUrl";
import { DeliveryOption } from "./DeliveryOption";
import { useState } from "react";

export function CartItemDetails({ loadCart, cartItem, deliveryOption }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newQuantity, setNewQuantity] = useState(cartItem.quantity);
  const [showDropdown, setShowDropdown] = useState(false);

  const deleteCartItem = async () => {
    const itemId = cartItem.id || cartItem.productId;
    await cartApi.deleteItem(itemId);
    await loadCart();
  };

  const updateCartItems = async () => {
    let quantityToSave = newQuantity;
    if (quantityToSave === "" || quantityToSave < 1) {
      setNewQuantity(cartItem.quantity);
      setIsEditing(false);
      return;
    }

    const itemId = cartItem.id || cartItem.productId;
    await cartApi.updateItem(itemId, quantityToSave);
    await loadCart();
    setIsEditing(false);
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      await updateCartItems();
    }
  };

  return (
    <div className="cart-item-details-grid">
      <img
        className="product-image"
        src={getProductImageUrl(cartItem.product?.image || cartItem.image)}
        alt={cartItem.product?.name || "Product"}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://placehold.co/150x150?text=Product";
        }}
      />

      <div className="cart-item-details">
        <div className="product-name">{cartItem.product.name}</div>
        <div className="product-price">
          {formatMoney(cartItem.product.priceCents)}
        </div>

        <div
          className="product-quantity"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "8px",
          }}
        >
          <span>Quantity:</span>

          {isEditing ? (
            <>
              {/* DROPDOWN IMPLEMENTATION MATCHED FROM PRODUCT PAGE */}
              <div style={{ position: "relative", display: "inline-block" }}>
                <input
                  type="number"
                  min="1"
                  value={newQuantity}
                  onChange={(e) => {
                    if (e.target.value === "") {
                      setNewQuantity("");
                    } else {
                      setNewQuantity(Number(e.target.value));
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={(e) => {
                    setShowDropdown(true);
                    e.target.select();
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowDropdown(false), 150);
                  }}
                  autoFocus
                  style={{
                    width: "60px",
                    padding: "4px 8px",
                    boxSizing: "border-box",
                    border: showDropdown
                      ? "2px solid #0f9d58"
                      : "1px solid #767676",
                    borderRadius: "4px",
                    textAlign: "left",
                    outline: "none",
                    backgroundColor: "white",
                  }}
                />

                {showDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%", /* Changed to top: 100% so it rolls downwards comfortably */
                      left: 0,
                      marginTop: "-1px",
                      width: "60px",
                      maxHeight: "200px",
                      overflowY: "auto",
                      backgroundColor: "white",
                      border: "1px solid #767676",
                      borderBottomLeftRadius: "4px",
                      borderBottomRightRadius: "4px",
                      boxShadow: "0px 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      zIndex: 10,
                      padding: "0",
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <div
                        key={num}
                        onMouseDown={async () => {
                          setNewQuantity(num);
                          setShowDropdown(false);
                          // Seamless inline API updates when selecting directly
                          await cartApi.updateItem(cartItem.productId, num);
                          await loadCart();
                          setIsEditing(false);
                        }}
                        style={{
                          padding: "4px 8px",
                          cursor: "pointer",
                          backgroundColor:
                            newQuantity === num ? "#1a73e8" : "white",
                          color: newQuantity === num ? "white" : "black",
                          textAlign: "left",
                          fontFamily: "sans-serif",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#1a73e8";
                          e.target.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor =
                            newQuantity === num ? "#1a73e8" : "white";
                          e.target.style.color =
                            newQuantity === num ? "white" : "black";
                        }}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <span
                className="update-quantity-link link-primary"
                style={{ cursor: "pointer" }}
                onClick={updateCartItems}
              >
                Save
              </span>

              <span
                className="update-quantity-link link-primary"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setNewQuantity(cartItem.quantity);
                  setIsEditing(false);
                }}
              >
                Cancel
              </span>
            </>
          ) : (
            <>
              <span
                className="quantity-label"
                style={{
                  display: "inline-block",
                  width: "60px",
                  padding: "4px 8px",
                  border: "1px solid #767676",
                  borderRadius: "4px",
                  backgroundColor: "#ffffff",
                  textAlign: "left",
                  boxSizing: "border-box",
                }}
              >
                {cartItem.quantity}
              </span>

              <span
                className="update-quantity-link link-primary"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setNewQuantity(cartItem.quantity);
                  setIsEditing(true);
                }}
              >
                Update
              </span>
            </>
          )}

          <span
            className="delete-quantity-link link-primary"
            style={{ cursor: "pointer" }}
            onClick={deleteCartItem}
          >
            Delete
          </span>
        </div>
      </div>

      <DeliveryOption
        deliveryOption={deliveryOption}
        cartItem={cartItem}
        loadCart={loadCart}
      />
    </div>
  );
}