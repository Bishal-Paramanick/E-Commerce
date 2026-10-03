package com.bishal.ecombackend.dto;

import com.bishal.ecombackend.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private UUID id;
    private String username;
    private OrderStatus status;
    private Long orderTimeMs;
    private Integer totalCostCents;
    private Integer shippingCostCents;
    private Integer taxCents;
    private String shippingAddress;
    private String paymentOrderId;
    private List<OrderItemResponse> products;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}