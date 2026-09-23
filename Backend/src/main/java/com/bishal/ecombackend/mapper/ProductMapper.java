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
        return new ProductDTO(
                entity.getId(),
                entity.getName(),
                entity.getImage(),
                entity.getPriceCents(),
                entity.getRating(),
                entity.getKeywords()
        );
    }

    public Product toEntity(ProductDTO dto) {
        if (dto == null) {
            return null;
        }
        Product product = new Product();
        product.setId(dto.getId() != null ? dto.getId() : UUID.randomUUID());
        product.setName(dto.getName());
        product.setImage(dto.getImage());
        product.setPriceCents(dto.getPriceCents());
        product.setRating(dto.getRating());
        product.setKeywords(dto.getKeywords());
        return product;
    }
}