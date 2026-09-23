package com.bishal.ecombackend.dto;

import com.bishal.ecombackend.model.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private UUID productId;
    private Integer quantity;
    private Long estimatedDeliveryTimeMs;
    private Product product; // Included if ?expand=products
}