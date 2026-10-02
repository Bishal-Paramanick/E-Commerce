package com.bishal.ecombackend.repo.specification;

import com.bishal.ecombackend.model.Product;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> filter(
            String search,
            Long categoryId,
            String brand,
            Integer minPriceCents,
            Integer maxPriceCents,
            Boolean inStock) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("brand")), pattern)
                ));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (brand != null && !brand.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("brand")), brand.trim().toLowerCase()));
            }

            if (minPriceCents != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("priceCents"), minPriceCents));
            }

            if (maxPriceCents != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("priceCents"), maxPriceCents));
            }

            if (Boolean.TRUE.equals(inStock)) {
                predicates.add(cb.greaterThan(root.get("stockQuantity"), 0));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}