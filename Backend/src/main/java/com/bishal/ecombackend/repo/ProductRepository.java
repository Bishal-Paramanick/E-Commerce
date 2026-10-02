package com.bishal.ecombackend.repo;

import com.bishal.ecombackend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    // Custom finder for case-insensitive product name lookups
    List<Product> findByNameContainingIgnoreCase(String name);
}