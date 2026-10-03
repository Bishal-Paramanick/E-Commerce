package com.bishal.ecombackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

// @Getter/@Setter instead of @Data: @Data generates equals/hashCode/toString over every field,
// including the LAZY user and the order lines, which can trigger lazy-loading errors.
@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Connects order to the authenticated user
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Column(nullable = false)
    private Integer totalCostCents;

    @Column(nullable = false)
    private Integer shippingCostCents;

    @Column(nullable = false)
    private Integer taxCents;

    @Column(nullable = false, length = 500)
    private String shippingAddress;

    @Column(nullable = false)
    private Long orderTimeMs;

    @Column(name = "payment_order_id")
    private String paymentOrderId;

    @Column(name = "payment_id")
    private String paymentId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "order_products", joinColumns = @JoinColumn(name = "order_id"))
    @Builder.Default
    private List<OrderItem> products = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}