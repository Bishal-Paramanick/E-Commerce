package com.bishal.ecombackend.service;

import com.bishal.ecombackend.dto.CategoryDTO;
import com.bishal.ecombackend.mapper.CategoryMapper;
import com.bishal.ecombackend.model.Category;
import com.bishal.ecombackend.repo.CategoryRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepo categoryRepo;
    private final CategoryMapper categoryMapper;

    @Transactional
    public CategoryDTO.Response createCategory(CategoryDTO.Request request) {
        log.info("Creating category: {}", request.getName());

        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepo.findById(request.getParentId())
                    .orElseThrow(() -> new NoSuchElementException("Parent category not found with id: " + request.getParentId()));
        }

        Category category = categoryMapper.toEntity(request, parent);
        Category saved = categoryRepo.save(category);
        log.info("Category '{}' created successfully with ID: {}", saved.getName(), saved.getId());
        return categoryMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO.Response> getCategoryTree() {
        return categoryRepo.findByParentCategoryIsNull().stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDTO.Response getCategoryById(Long id) {
        Category category = categoryRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Category not found with id: " + id));
        return categoryMapper.toResponse(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        log.info("Deleting category id: {}", id);
        if (!categoryRepo.existsById(id)) {
            throw new NoSuchElementException("Category not found with id: " + id);
        }
        categoryRepo.deleteById(id);
        log.info("Category with ID {} deleted successfully", id);
    }
}