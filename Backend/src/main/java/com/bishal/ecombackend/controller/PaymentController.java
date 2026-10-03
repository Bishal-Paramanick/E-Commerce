package com.bishal.ecombackend.controller;

import com.bishal.ecombackend.dto.PaymentVerificationRequest;
import com.bishal.ecombackend.dto.PaymentVerificationResponse;
import com.bishal.ecombackend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
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

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, String>> handleRazorpayWebhook(
            @RequestBody String rawPayload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signatureHeader) {
        log.info("Received Razorpay webhook event");
        paymentService.processWebhook(rawPayload, signatureHeader);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}