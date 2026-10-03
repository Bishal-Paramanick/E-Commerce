package com.bishal.ecombackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "user_addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address extends BaseAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private Users user;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, length = 255)
    private String streetAddress;

    @Column(length = 100)
    private String landmark;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(nullable = false, length = 20)
    private String postalCode;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String country = "India";

    @Column(nullable = false)
    @Builder.Default
    private boolean isDefault = false;

    public String toFormattedAddress() {
        StringBuilder sb = new StringBuilder();
        sb.append(fullName).append(", ");
        sb.append(streetAddress);
        if (landmark != null && !landmark.isBlank()) {
            sb.append(" (Near ").append(landmark).append(")");
        }
        sb.append(", ").append(city).append(", ").append(state).append(" - ").append(postalCode);
        sb.append(", ").append(country).append(". Phone: ").append(phone);
        return sb.toString();
    }
}