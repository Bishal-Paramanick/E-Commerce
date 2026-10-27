package com.bishal.ecombackend.delivery.controller;

import com.bishal.ecombackend.delivery.dto.DeliveryOptionResponse;
import com.bishal.ecombackend.delivery.service.DeliveryOptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery-options")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DeliveryOptionController {

    private final DeliveryOptionService deliveryOptionService;

    @GetMapping
    public ResponseEntity<List<DeliveryOptionResponse>> getDeliveryOptions(@RequestParam(required = false) String expand) {
        return ResponseEntity.ok(deliveryOptionService.getDeliveryOptions(expand));
    }
}