package com.bishal.ecombackend.controller;

import com.bishal.ecombackend.dto.CheckoutRequest;
import com.bishal.ecombackend.dto.OrderResponse;
import com.bishal.ecombackend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // POST /api/orders/checkout or POST /api/orders
    @PostMapping(path = {"/checkout", ""})
    public ResponseEntity<OrderResponse> placeOrder(
            Authentication authentication,
            @RequestBody(required = false) CheckoutRequest request) {
        String username = authentication.getName();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.checkout(username, request));
    }

    // GET /api/orders (Authenticated User's Order History)
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            Authentication authentication,
            @RequestParam(required = false) String expand) {
        String username = authentication.getName();
        return ResponseEntity.ok(orderService.getUserOrders(username, expand));
    }

    // GET /api/orders/{orderId} (Authenticated User's Order Details)
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(
            Authentication authentication,
            @PathVariable UUID orderId,
            @RequestParam(required = false) String expand) {
        String username = authentication.getName();
        return ResponseEntity.ok(orderService.getUserOrderById(username, orderId, expand));
    }
}