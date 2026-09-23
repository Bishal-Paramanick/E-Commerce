package com.bishal.ecombackend.controller;

import com.bishal.ecombackend.dto.PaymentSummaryResponse;
import com.bishal.ecombackend.model.CartItem;
import com.bishal.ecombackend.repo.CartItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/payment-summary")
@RequiredArgsConstructor
public class PaymentSummaryController {

    private final CartItemRepository cartItemRepository;

    @GetMapping
    public ResponseEntity<PaymentSummaryResponse> getPaymentSummary() {
        List<CartItem> cartItems = cartItemRepository.findAll();

        int totalItems = 0;
        int productCostCents = 0;
        int shippingCostCents = 0;

        for (CartItem item : cartItems) {
            int qty = item.getQuantity() != null ? item.getQuantity() : 1;
            totalItems += qty;

            if (item.getProduct() != null && item.getProduct().getPriceCents() != null) {
                productCostCents += item.getProduct().getPriceCents() * qty;
            }

            if (item.getDeliveryOption() != null && item.getDeliveryOption().getPriceCents() != null) {
                shippingCostCents += item.getDeliveryOption().getPriceCents();
            }
        }

        int totalCostBeforeTaxCents = productCostCents + shippingCostCents;
        int taxCents = (int) Math.round(totalCostBeforeTaxCents * 0.10); // 10% estimated tax
        int totalCostCents = totalCostBeforeTaxCents + taxCents;

        PaymentSummaryResponse response = PaymentSummaryResponse.builder()
                .totalItems(totalItems)
                .productCostCents(productCostCents)
                .shippingCostCents(shippingCostCents)
                .totalCostBeforeTaxCents(totalCostBeforeTaxCents)
                .taxCents(taxCents)
                .totalCostCents(totalCostCents)
                .build();

        return ResponseEntity.ok(response);
    }
}