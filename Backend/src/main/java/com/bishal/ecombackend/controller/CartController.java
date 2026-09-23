package com.bishal.ecombackend.controller;

import com.bishal.ecombackend.dto.AddToCartRequest;
import com.bishal.ecombackend.dto.CartItemResponse;
import com.bishal.ecombackend.dto.UpdateCartRequest;
import com.bishal.ecombackend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getCart(@RequestParam(required = false) String expand) {
        return ResponseEntity.ok(cartService.getCartItems(expand));
    }

    @PostMapping
    public ResponseEntity<?> addToCart(@RequestBody AddToCartRequest request) {
        if (request.getProductId() == null || request.getQuantity() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "productId and quantity are required"));
        }
        if (request.getQuantity() < 1 || request.getQuantity() > 10) {
            return ResponseEntity.badRequest().body(Map.of("error", "Quantity must be between 1 and 10"));
        }

        try {
            CartItemResponse response = cartService.addToCart(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{productId}")
    public ResponseEntity<?> updateCartItem(
            @PathVariable UUID productId,
            @RequestBody UpdateCartRequest request) {

        if (request.getQuantity() != null && request.getQuantity() < 1) {
            return ResponseEntity.badRequest().body(Map.of("error", "Quantity must be greater than 0"));
        }

        try {
            CartItemResponse response = cartService.updateCartItem(productId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Cart item not found"));
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteCartItem(@PathVariable UUID productId) {
        try {
            cartService.removeCartItem(productId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}