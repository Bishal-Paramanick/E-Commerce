package com.bishal.ecombackend.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    private UUID productId;
    private Integer quantity;
    private Long estimatedDeliveryTimeMs;
}