package com.bishal.ecombackend.model;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

public enum OrderStatus {
    PENDING,
    PAID,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED;

    // Defines which next statuses are valid from the current state
    public Set<OrderStatus> nextValidStatuses() {
        return switch (this) {
            case PENDING -> EnumSet.of(PAID, CANCELLED);
            case PAID -> EnumSet.of(PROCESSING, CANCELLED);
            case PROCESSING -> EnumSet.of(SHIPPED, CANCELLED);
            case SHIPPED -> EnumSet.of(DELIVERED);
            case DELIVERED, CANCELLED -> Collections.emptySet(); // Terminal states
        };
    }

    public boolean canTransitionTo(OrderStatus nextStatus) {
        return nextValidStatuses().contains(nextStatus);
    }

    public boolean isCancellable() {
        return this == PENDING || this == PAID || this == PROCESSING;
    }
}