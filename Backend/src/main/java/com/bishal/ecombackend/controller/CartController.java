package com.bishal.ecombackend.controller;

import com.bishal.ecombackend.dto.AddToCartRequest;
import com.bishal.ecombackend.dto.CartItemResponse;
import com.bishal.ecombackend.dto.CartSummaryResponse;
import com.bishal.ecombackend.dto.UpdateCartRequest;
import com.bishal.ecombackend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getCart(
            Principal principal,
            @RequestParam(required = false) String expand
    ) {
        return ResponseEntity.ok(cartService.getCartItems(principal.getName(), expand));
    }

    @GetMapping("/summary")
    public ResponseEntity<CartSummaryResponse> getCartSummary(Principal principal) {
        return ResponseEntity.ok(cartService.getCartSummary(principal.getName()));
    }

    @PostMapping("/items")
    public ResponseEntity<?> addToCart(
            Principal principal,
            @RequestBody AddToCartRequest request
    ) {
        if (request.getProductId() == null || request.getQuantity() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "productId and quantity are required"));
        }
        if (request.getQuantity() < 1) {
            return ResponseEntity.badRequest().body(Map.of("error", "Quantity must be at least 1"));
        }

        try {
            CartItemResponse response = cartService.addToCart(principal.getName(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateCartItem(
            Principal principal,
            @PathVariable UUID itemId,
            @RequestBody UpdateCartRequest request
    ) {
        if (request.getQuantity() != null && request.getQuantity() < 1) {
            return ResponseEntity.badRequest().body(Map.of("error", "Quantity must be greater than 0"));
        }

        try {
            CartItemResponse response = cartService.updateCartItem(principal.getName(), itemId, request);
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> deleteCartItem(
            Principal principal,
            @PathVariable UUID itemId
    ) {
        try {
            cartService.removeCartItem(principal.getName(), itemId);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(Principal principal) {
        cartService.clearCart(principal.getName());
        return ResponseEntity.noContent().build();
    }
}