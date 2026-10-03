package com.bishal.ecombackend.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

    private UUID addressId;

    @Size(max = 500, message = "Shipping address cannot exceed 500 characters")
    private String shippingAddress;
}