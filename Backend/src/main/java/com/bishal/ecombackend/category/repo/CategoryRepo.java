package com.bishal.ecombackend.category.repo;

import com.bishal.ecombackend.category.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepo extends JpaRepository<Category, Long> {
    List<Category> findByParentCategoryIsNull(); // Top-level categories
}