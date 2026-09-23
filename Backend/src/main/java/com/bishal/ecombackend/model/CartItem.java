package com.bishal.ecombackend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuppressWarnings("all")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "delivery_option_id", nullable = false)
    private DeliveryOption deliveryOption;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Explicit Getter & Setter for DeliveryOption
    public DeliveryOption getDeliveryOption() {
        return this.deliveryOption;
    }

    public void setDeliveryOption(DeliveryOption deliveryOption) {
        this.deliveryOption = deliveryOption;
    }

    // Helper getters for frontend JSON serialization
    @JsonProperty("productId")
    public UUID getProductId() {
        return product != null ? product.getId() : null;
    }

    @JsonProperty("deliveryOptionId")
    public String getDeliveryOptionId() {
        return deliveryOption != null ? deliveryOption.getId() : "1";
    }
}