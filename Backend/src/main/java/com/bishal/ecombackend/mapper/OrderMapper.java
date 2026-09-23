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

        return new OrderResponse(
                entity.getId(),
                entity.getOrderTimeMs(),
                entity.getTotalCostCents(),
                itemResponses,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public OrderItemResponse toOrderItemResponse(OrderItem item, boolean expandProducts) {
        if (item == null) {
            return null;
        }

        Product product = expandProducts && item.getProductId() != null
                ? productRepository.findById(item.getProductId()).orElse(null)
                : null;

        return new OrderItemResponse(
                item.getProductId(),
                item.getQuantity(),
                item.getEstimatedDeliveryTimeMs(),
                product
        );
    }
}