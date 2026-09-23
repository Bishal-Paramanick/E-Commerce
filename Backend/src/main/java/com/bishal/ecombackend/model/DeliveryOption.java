package com.bishal.ecombackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_options")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuppressWarnings("all")
public class DeliveryOption {

    @Id
    private String id;

    @Column(nullable = false)
    private Integer deliveryDays;

    @Column(nullable = false)
    private Integer priceCents;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Custom 3-argument constructor for seeding
    public DeliveryOption(String id, Integer deliveryDays, Integer priceCents) {
        this.id = id;
        this.deliveryDays = deliveryDays;
        this.priceCents = priceCents;
    }
}