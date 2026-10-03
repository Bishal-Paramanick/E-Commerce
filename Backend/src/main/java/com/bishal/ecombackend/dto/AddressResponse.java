package com.bishal.ecombackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {
    private UUID id;
    private String fullName;
    private String phone;
    private String streetAddress;
    private String landmark;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private boolean isDefault;
    private String formattedAddress;
}