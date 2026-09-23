package com.bishal.ecombackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryOptionResponse {
    private String id;
    private Integer deliveryDays;
    private Integer priceCents;
    private Long estimatedDeliveryTimeMs; // Included if ?expand=estimatedDeliveryTime
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}