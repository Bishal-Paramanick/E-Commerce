package com.bishal.ecombackend.repo;

import com.bishal.ecombackend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepo extends JpaRepository<Category, Long> {
    List<Category> findByParentCategoryIsNull(); // Top-level categories
}