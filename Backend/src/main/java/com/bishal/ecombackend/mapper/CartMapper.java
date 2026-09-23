package com.bishal.ecombackend.mapper;

import com.bishal.ecombackend.dto.CartItemResponse;
import com.bishal.ecombackend.dto.CartSummaryResponse;
import com.bishal.ecombackend.model.CartItem;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CartMapper {

    public CartItemResponse toResponse(CartItem entity, boolean expandProduct) {
        if (entity == null) {
            return null;
        }
        return new CartItemResponse(
                entity.getId(),
                entity.getProduct().getId(),
                entity.getQuantity(),
                entity.getDeliveryOption().getId(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                expandProduct ? entity.getProduct() : null
        );
    }

    public CartSummaryResponse toSummaryResponse(List<CartItem> cartItems) {
        int totalItems = 0;
        int productCostCents = 0;
        int shippingCostCents = 0;

        for (CartItem item : cartItems) {
            totalItems += item.getQuantity();
            productCostCents += item.getProduct().getPriceCents() * item.getQuantity();
            shippingCostCents += item.getDeliveryOption().getPriceCents();
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