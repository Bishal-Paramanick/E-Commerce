package com.bishal.ecombackend.dto;

import com.bishal.ecombackend.model.Rating;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDTO {
    private UUID id;
    private String name;
    private String image;
    private Integer priceCents;
    private Rating rating;
    private List<String> keywords;
}