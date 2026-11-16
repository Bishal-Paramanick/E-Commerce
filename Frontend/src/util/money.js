import dayjs from "dayjs";

// Single source of truth for currency conversion (USD → INR).
// Import this wherever you display a converted price (e.g. the catalog price slider).
export const USD_TO_INR_RATE = 5.2;

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export function formatMoney(amountCents) {
  const dollars = Number(amountCents || 0) / 100;
  return inrFormatter.format(dollars * USD_TO_INR_RATE);
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

  const deliveryPercent = (timePassedMs / totalDeliveryTimeMs) * 100;

  // Clamp between 10% (minimum visible width for new orders) and 100%
  return Math.round(Math.min(100, Math.max(10, deliveryPercent)));
}