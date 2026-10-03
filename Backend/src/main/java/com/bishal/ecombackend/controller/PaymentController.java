package com.bishal.ecombackend.controller;

import com.bishal.ecombackend.dto.PaymentVerificationRequest;
import com.bishal.ecombackend.dto.PaymentVerificationResponse;
import com.bishal.ecombackend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/verify")
    public ResponseEntity<PaymentVerificationResponse> verifyPayment(
            Authentication authentication,
            @Valid @RequestBody PaymentVerificationRequest request) {
        String username = authentication.getName();
        return ResponseEntity.ok(paymentService.verifyPayment(username, request));
    }
}