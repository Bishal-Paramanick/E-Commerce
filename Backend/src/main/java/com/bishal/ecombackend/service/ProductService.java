package com.bishal.ecombackend.service;

import com.bishal.ecombackend.dto.ProductDTO;
import com.bishal.ecombackend.mapper.ProductMapper;
import com.bishal.ecombackend.model.Product;
import com.bishal.ecombackend.repo.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public List<ProductDTO> getAllProducts(String search) {
        List<Product> products = productRepository.findAll();

        if (search != null && !search.trim().isEmpty()) {
            String query = search.toLowerCase().trim();
            products = products.stream().filter(p -> {
                boolean matchName = p.getName() != null && p.getName().toLowerCase().contains(query);
                boolean matchKeywords = p.getKeywords() != null &&
                        p.getKeywords().stream().anyMatch(k -> k.toLowerCase().contains(query));
                return matchName || matchKeywords;
            }).toList();
        }

        return products.stream()
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO getProductById(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Product not found with id: " + productId));
        return productMapper.toDTO(product);
    }

    public ProductDTO createProduct(ProductDTO dto) {
        Product product = productMapper.toEntity(dto);
        Product saved = productRepository.save(product);
        return productMapper.toDTO(saved);
    }
}