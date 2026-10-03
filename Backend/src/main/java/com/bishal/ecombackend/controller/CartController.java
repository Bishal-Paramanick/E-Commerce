package com.bishal.ecombackend.controller;

import com.bishal.ecombackend.dto.AddToCartRequest;
import com.bishal.ecombackend.dto.CartItemResponse;
import com.bishal.ecombackend.dto.CartSummaryResponse;
import com.bishal.ecombackend.dto.UpdateCartRequest;
import com.bishal.ecombackend.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
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
    public ResponseEntity<CartItemResponse> addToCart(
            Principal principal,
            @Valid @RequestBody AddToCartRequest request
    ) {
        CartItemResponse response = cartService.addToCart(principal.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartItemResponse> updateCartItem(
            Principal principal,
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateCartRequest request
    ) {
        CartItemResponse response = cartService.updateCartItem(principal.getName(), itemId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> deleteCartItem(
            Principal principal,
            @PathVariable UUID itemId
    ) {
        cartService.removeCartItem(principal.getName(), itemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(Principal principal) {
        cartService.clearCart(principal.getName());
        return ResponseEntity.noContent().build();
    }
}