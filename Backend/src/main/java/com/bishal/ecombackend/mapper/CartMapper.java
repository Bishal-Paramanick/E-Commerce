package com.bishal.ecombackend.mapper;

import com.bishal.ecombackend.dto.CartItemResponse;
import com.bishal.ecombackend.dto.CartSummaryResponse;
import com.bishal.ecombackend.model.CartItem;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class CartMapper {

    public CartItemResponse toResponse(CartItem entity, boolean expandProduct) {
        if (entity == null) {
            return null;
        }

        UUID productId = (entity.getProduct() != null) ? entity.getProduct().getId() : null;
        String deliveryOptionId = (entity.getDeliveryOption() != null)
                ? entity.getDeliveryOption().getId()
                : "1";

        int unitPriceCents = (entity.getProduct() != null && entity.getProduct().getPriceCents() != null)
                ? entity.getProduct().getPriceCents()
                : 0;

        int quantity = (entity.getQuantity() != null) ? entity.getQuantity() : 0;
        int subtotalCents = unitPriceCents * quantity;

        return CartItemResponse.builder()
                .id(entity.getId())
                .productId(productId)
                .quantity(quantity)
                .deliveryOptionId(deliveryOptionId)
                .unitPriceCents(unitPriceCents)
                .subtotalCents(subtotalCents)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .product(expandProduct ? entity.getProduct() : null)
                .build();
    }

    public CartSummaryResponse toSummaryResponse(List cartItems) {
        if (cartItems == null || cartItems.isEmpty()) {
            return new CartSummaryResponse(0, 0, 0, 0, 0, 0);
        }

        int totalItems = 0;
        int productCostCents = 0;
        int shippingCostCents = 0;

        for (Object obj : cartItems) {
            if (!(obj instanceof CartItem item)) {
                continue;
            }

            int qty = (item.getQuantity() != null) ? item.getQuantity() : 0;
            totalItems += qty;

            if (item.getProduct() != null && item.getProduct().getPriceCents() != null) {
                productCostCents += item.getProduct().getPriceCents() * qty;
            }

            if (item.getDeliveryOption() != null && item.getDeliveryOption().getPriceCents() != null) {
                shippingCostCents += item.getDeliveryOption().getPriceCents();
            }
        }

        int totalCostBeforeTaxCents = productCostCents + shippingCostCents;
        int taxCents = (int) Math.round(totalCostBeforeTaxCents * 0.10);
        int totalCostCents = totalCostBeforeTaxCents + taxCents;

        return new CartSummaryResponse(
                totalItems,
                productCostCents,
                shippingCostCents,
                totalCostBeforeTaxCents,
                taxCents,
                totalCostCents
        );
    }
}