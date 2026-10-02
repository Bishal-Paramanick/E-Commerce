package com.bishal.ecombackend.dto;

import com.bishal.ecombackend.model.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private UUID id;
    private UUID productId;
    private Integer quantity;
    private String deliveryOptionId;
    private Integer unitPriceCents;
    private Integer subtotalCents;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Product product;

    // 7-argument constructor used by CartMapper
    public CartItemResponse(UUID id, UUID productId, Integer quantity, String deliveryOptionId,
                            LocalDateTime createdAt, LocalDateTime updatedAt, Product product) {
        this.id = id;
        this.productId = productId;
        this.quantity = quantity;
        this.deliveryOptionId = deliveryOptionId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.product = product;
        if (product != null && product.getPriceCents() != null) {
            this.unitPriceCents = product.getPriceCents();
            this.subtotalCents = product.getPriceCents() * (quantity != null ? quantity : 0);
        }
    }
}