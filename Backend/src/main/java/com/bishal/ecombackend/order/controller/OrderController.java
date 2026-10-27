package com.bishal.ecombackend.order.controller;

import com.bishal.ecombackend.order.dto.CheckoutRequest;
import com.bishal.ecombackend.order.dto.OrderResponse;
import com.bishal.ecombackend.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;


@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping(path = {"/checkout", ""})
    public ResponseEntity<OrderResponse> placeOrder(
            Authentication authentication,
            @Valid @RequestBody(required = false) CheckoutRequest request) {
        String username = authentication.getName();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.checkout(username, request));
    }

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getMyOrders(
            Authentication authentication,
            @RequestParam(required = false) String expand,
            @PageableDefault(page = 0, size = 10, sort = "orderTimeMs", direction = Sort.Direction.DESC) Pageable pageable) {
        String username = authentication.getName();
        return ResponseEntity.ok(orderService.getUserOrders(username, expand, pageable));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(
            Authentication authentication,
            @PathVariable UUID orderId,
            @RequestParam(required = false) String expand) {
        String username = authentication.getName();
        return ResponseEntity.ok(orderService.getUserOrderById(username, orderId, expand));
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            Authentication authentication,
            @PathVariable UUID orderId) {
        String username = authentication.getName();
        return ResponseEntity.ok(orderService.cancelOrder(username, orderId));
    }
}