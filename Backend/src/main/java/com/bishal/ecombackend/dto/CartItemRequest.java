package com.bishal.ecombackend.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class CartItemRequest {
    private UUID productId;
    private Integer quantity;
    private String deliveryOptionId;
}