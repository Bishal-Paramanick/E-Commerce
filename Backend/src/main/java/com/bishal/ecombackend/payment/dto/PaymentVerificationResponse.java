package com.bishal.ecombackend.payment.dto;

import com.bishal.ecombackend.order.model.OrderStatus;
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