package com.bishal.ecombackend.mapper;

import com.bishal.ecombackend.dto.CategoryDTO;
import com.bishal.ecombackend.model.Category;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CategoryMapper {

    public CategoryDTO.Response toResponse(Category category) {
        if (category == null) {
            return null;
        }

        // Fixed generic parameter
        List<CategoryDTO.Response> subCategories = category.getSubCategories() != null
                ? category.getSubCategories().stream()
                .map(this::toResponse)
                .collect(Collectors.toList())
                : Collections.emptyList();

        return new CategoryDTO.Response(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getParentCategory() != null ? category.getParentCategory().getId() : null,
                category.getParentCategory() != null ? category.getParentCategory().getName() : null,
                subCategories
        );
    }

    public Category toEntity(CategoryDTO.Request request, Category parentCategory) {
        if (request == null) {
            return null;
        }

        return new Category(
                request.getName(),
                request.getDescription(),
                parentCategory
        );
    }
}