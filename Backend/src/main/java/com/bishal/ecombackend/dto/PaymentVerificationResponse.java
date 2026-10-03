package com.bishal.ecombackend.dto;

import com.bishal.ecombackend.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerificationResponse {
    private UUID orderId;
    private OrderStatus status;
    private String message;
}