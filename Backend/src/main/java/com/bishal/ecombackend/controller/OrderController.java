package com.bishal.ecombackend.controller;

import com.bishal.ecombackend.dto.OrderResponse;
import com.bishal.ecombackend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getOrders(@RequestParam(required = false) String expand) {
        return ResponseEntity.ok(orderService.getAllOrders(expand));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(
            @PathVariable UUID orderId,
            @RequestParam(required = false) String expand) {
        try {
            return ResponseEntity.ok(orderService.getOrderById(orderId, expand));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Order not found"));
        }
    }

    @PostMapping
    public ResponseEntity<?> placeOrder() {
        try {
            OrderResponse order = orderService.placeOrder();
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}