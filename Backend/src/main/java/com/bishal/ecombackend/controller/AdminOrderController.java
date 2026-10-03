package com.bishal.ecombackend.controller;

import com.bishal.ecombackend.dto.OrderResponse;
import com.bishal.ecombackend.dto.UpdateOrderStatusRequest;
import com.bishal.ecombackend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponse>> getAllOrders(
            @RequestParam(required = false) String expand) {
        return ResponseEntity.ok(orderService.getAllOrdersAdmin(expand));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable UUID id,
            @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatusAdmin(id, request));
    }
}