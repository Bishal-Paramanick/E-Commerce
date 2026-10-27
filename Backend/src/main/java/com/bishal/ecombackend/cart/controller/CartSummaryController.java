package com.bishal.ecombackend.cart.controller;

import com.bishal.ecombackend.cart.dto.CartSummaryResponse;
import com.bishal.ecombackend.cart.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart-summary")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CartSummaryController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartSummaryResponse> getCartSummary() {
        return ResponseEntity.ok(cartService.getCartSummary());
    }
}