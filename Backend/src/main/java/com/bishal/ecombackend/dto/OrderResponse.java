package com.bishal.ecombackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private UUID id;
    private Long orderTimeMs;
    private Integer totalCostCents;
    private List<OrderItemResponse> products;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}