package com.bishal.ecombackend.delivery.mapper;

import com.bishal.ecombackend.delivery.dto.DeliveryOptionResponse;
import com.bishal.ecombackend.delivery.model.DeliveryOption;
import org.springframework.stereotype.Component;

@Component
public class DeliveryOptionMapper {

    public DeliveryOptionResponse toResponse(DeliveryOption entity, boolean expandEstimatedDeliveryTime) {
        if (entity == null) {
            return null;
        }

        Long estimatedDeliveryTimeMs = null;
        if (expandEstimatedDeliveryTime && entity.getDeliveryDays() != null) {
            estimatedDeliveryTimeMs = System.currentTimeMillis() + (entity.getDeliveryDays() * 24L * 60 * 60 * 1000);
        }

        return new DeliveryOptionResponse(
                entity.getId(),
                entity.getDeliveryDays(),
                entity.getPriceCents(),
                estimatedDeliveryTimeMs,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}