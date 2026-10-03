package com.bishal.ecombackend.dto;

import com.bishal.ecombackend.model.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private UUID productId;
    private Integer quantity;
    private Integer unitPriceCents;
    private Integer subtotalCents;
    private String deliveryOptionId;
    private Long estimatedDeliveryTimeMs;
    private Product product; // Populated if expand=products
}