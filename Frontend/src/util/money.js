import dayjs from "dayjs";

export function formatMoney(amountCents) {
  // Multiply dollar value by 92 for INR conversion
  const rupees = (Number(amountCents || 0) / 100) * 52;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(rupees);
}

export function deliveryPercentage({ item, order }) {
  if (!order?.orderTimeMs || !item?.estimatedDeliveryTimeMs) {
    return 10;
  }

  const currentTimeMs = dayjs().valueOf();
  const orderTimeMs = Number(order.orderTimeMs);
  const deliveryTimeMs = Number(item.estimatedDeliveryTimeMs);

  const totalDeliveryTimeMs = deliveryTimeMs - orderTimeMs;
  const timePassedMs = currentTimeMs - orderTimeMs;

  if (totalDeliveryTimeMs <= 0) {
    return 100;
  }

  let deliveryPercent = (timePassedMs / totalDeliveryTimeMs) * 100;

  // Set a minimum visible width of 10% for newly placed orders
  if (deliveryPercent < 10) {
    deliveryPercent = 10;
  } else if (deliveryPercent > 100) {
    deliveryPercent = 100;
  }

  return Math.round(deliveryPercent);
}