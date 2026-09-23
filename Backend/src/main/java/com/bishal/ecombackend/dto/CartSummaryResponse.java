package com.bishal.ecombackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartSummaryResponse {
    private Integer totalItems;
    private Integer productCostCents;
    private Integer shippingCostCents;
    private Integer totalCostBeforeTaxCents;
    private Integer taxCents;
    private Integer totalCostCents;
}