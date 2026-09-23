package com.bishal.ecombackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSummaryResponse {
    private Integer totalItems;
    private Integer productCostCents;
    private Integer shippingCostCents;
    private Integer totalCostBeforeTaxCents;
    private Integer taxCents;
    private Integer totalCostCents;
}