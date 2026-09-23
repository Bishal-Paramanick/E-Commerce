package com.bishal.ecombackend.dto;

import com.bishal.ecombackend.model.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private UUID id;
    private UUID productId;
    private Integer quantity;
    private String deliveryOptionId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Product product; // Included if ?expand=product
}