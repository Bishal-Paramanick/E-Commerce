package com.bishal.ecombackend.mapper;

import com.bishal.ecombackend.dto.OrderItemResponse;
import com.bishal.ecombackend.dto.OrderResponse;
import com.bishal.ecombackend.model.Order;
import com.bishal.ecombackend.model.OrderItem;
import com.bishal.ecombackend.model.Product;
import com.bishal.ecombackend.repo.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final ProductRepository productRepository;

    public OrderResponse toResponse(Order entity, boolean expandProducts) {
        if (entity == null) {
            return null;
        }

        List<OrderItemResponse> itemResponses = entity.getProducts() != null
                ? entity.getProducts().stream()
                .map(item -> toOrderItemResponse(item, expandProducts))
                .collect(Collectors.toList())
                : Collections.emptyList();

        return OrderResponse.builder()
                .id(entity.getId())
                .username(entity.getUser() != null ? entity.getUser().getUsername() : null)
                .status(entity.getStatus())
                .orderTimeMs(entity.getOrderTimeMs())
                .totalCostCents(entity.getTotalCostCents())
                .shippingCostCents(entity.getShippingCostCents())
                .taxCents(entity.getTaxCents())
                .shippingAddress(entity.getShippingAddress())
                .paymentOrderId(entity.getPaymentOrderId())
                .products(itemResponses)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public OrderItemResponse toOrderItemResponse(OrderItem item, boolean expandProducts) {
        if (item == null) {
            return null;
        }

        Product product = expandProducts && item.getProductId() != null
                ? productRepository.findById(item.getProductId()).orElse(null)
                : null;

        return OrderItemResponse.builder()
                .productId(item.getProductId())
                .quantity(item.getQuantity())
                .unitPriceCents(item.getUnitPriceCents())
                .subtotalCents(item.getSubtotalCents())
                .deliveryOptionId(item.getDeliveryOptionId())
                .estimatedDeliveryTimeMs(item.getEstimatedDeliveryTimeMs())
                .product(product)
                .build();
    }
}