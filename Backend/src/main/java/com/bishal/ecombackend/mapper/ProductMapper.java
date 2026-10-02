package com.bishal.ecombackend.mapper;

import com.bishal.ecombackend.dto.ProductDTO;
import com.bishal.ecombackend.model.Product;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ProductMapper {

    public ProductDTO toDTO(Product entity) {
        if (entity == null) {
            return null;
        }

        ProductDTO dto = new ProductDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setImage(entity.getImage());
        dto.setPriceCents(entity.getPriceCents());
        dto.setRating(entity.getRating());
        dto.setKeywords(entity.getKeywords());

        // Catalog-specific fields
        dto.setBrand(entity.getBrand());
        dto.setStockQuantity(entity.getStockQuantity());

        if (entity.getCategory() != null) {
            dto.setCategoryId(entity.getCategory().getId());
            dto.setCategoryName(entity.getCategory().getName());
        }

        return dto;
    }

    public Product toEntity(ProductDTO dto) {
        if (dto == null) {
            return null;
        }

        Product product = new Product();
        product.setId(dto.getId() != null ? dto.getId() : UUID.randomUUID());
        product.setName(dto.getName());
        product.setImage(dto.getImage() != null ? dto.getImage() : "");
        product.setPriceCents(dto.getPriceCents());
        product.setRating(dto.getRating());
        product.setKeywords(dto.getKeywords());

        // Catalog-specific fields
        product.setBrand(dto.getBrand());
        product.setStockQuantity(dto.getStockQuantity() != null ? dto.getStockQuantity() : 0);
        // Note: The Category entity itself is looked up & attached in ProductService

        return product;
    }
}