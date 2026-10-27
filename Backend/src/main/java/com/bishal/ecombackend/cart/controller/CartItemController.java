package com.bishal.ecombackend.cart.controller;

import com.bishal.ecombackend.cart.dto.AddToCartRequest;
import com.bishal.ecombackend.cart.dto.CartItemResponse;
import com.bishal.ecombackend.cart.dto.UpdateCartRequest;
import com.bishal.ecombackend.cart.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart-items")
@RequiredArgsConstructor
public class CartItemController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getCartItems(
            @RequestParam(required = false, defaultValue = "") String expand) {
        return ResponseEntity.ok(cartService.getCartItems(expand));
    }

    @PostMapping
    public ResponseEntity<CartItemResponse> addToCart(@RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(cartService.addToCart(request));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<CartItemResponse> updateCartItem(
            @PathVariable UUID productId,
            @RequestBody UpdateCartRequest request) {
        return ResponseEntity.ok(cartService.updateCartItem(productId, request));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteCartItem(@PathVariable UUID productId) {
        cartService.removeCartItem(productId);
        return ResponseEntity.noContent().build();
    }
}