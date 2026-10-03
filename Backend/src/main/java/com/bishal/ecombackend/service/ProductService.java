package com.bishal.ecombackend.service;

import com.bishal.ecombackend.dto.ProductDTO;
import com.bishal.ecombackend.mapper.ProductMapper;
import com.bishal.ecombackend.model.Category;
import com.bishal.ecombackend.model.Product;
import com.bishal.ecombackend.repo.CategoryRepo;
import com.bishal.ecombackend.repo.ProductRepository;
import com.bishal.ecombackend.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.NoSuchElementException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final CategoryRepo categoryRepo;

    private static final String UPLOAD_DIR = "uploads/products/";

    // 1. Dynamic filtering + Pagination at the database level
    public Page<ProductDTO> getProducts(
            String search,
            Long categoryId,
            String brand,
            Integer minPriceCents,
            Integer maxPriceCents,
            Boolean inStock,
            Pageable pageable) {

        Specification<Product> spec = ProductSpecification.filter(
                search, categoryId, brand, minPriceCents, maxPriceCents, inStock
        );

        return productRepository.findAll(spec, pageable).map(productMapper::toDTO);
    }

    // 2. Fetch single product by UUID
    public ProductDTO getProductById(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Product not found with id: " + productId));
        return productMapper.toDTO(product);
    }

    // 3. Create product with category attachment
    public ProductDTO createProduct(ProductDTO dto) {
        log.info("Creating product: {}", dto.getName());

        Product product = productMapper.toEntity(dto);

        if (product.getId() == null) {
            product.setId(UUID.randomUUID());
        }

        if (dto.getCategoryId() != null) {
            Category category = categoryRepo.findById(dto.getCategoryId())
                    .orElseThrow(() -> new NoSuchElementException("Category not found with id: " + dto.getCategoryId()));
            product.setCategory(category);
        }

        Product saved = productRepository.save(product);
        log.info("Product created successfully with ID: {}", saved.getId());
        return productMapper.toDTO(saved);
    }

    // 4. Update product
    public ProductDTO updateProduct(UUID productId, ProductDTO dto) {
        log.info("Updating product id: {}", productId);

        Product existing = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Product not found with id: " + productId));

        existing.setName(dto.getName());
        existing.setImage(dto.getImage());
        existing.setPriceCents(dto.getPriceCents());
        existing.setBrand(dto.getBrand());
        existing.setStockQuantity(dto.getStockQuantity() != null ? dto.getStockQuantity() : 0);
        existing.setRating(dto.getRating());
        existing.setKeywords(dto.getKeywords());

        if (dto.getCategoryId() != null) {
            Category category = categoryRepo.findById(dto.getCategoryId())
                    .orElseThrow(() -> new NoSuchElementException("Category not found with id: " + dto.getCategoryId()));
            existing.setCategory(category);
        }

        Product updated = productRepository.save(existing);
        return productMapper.toDTO(updated);
    }

    // 5. Delete product
    public void deleteProduct(UUID productId) {
        log.info("Deleting product id: {}", productId);
        if (!productRepository.existsById(productId)) {
            throw new NoSuchElementException("Product not found with id: " + productId);
        }
        productRepository.deleteById(productId);
    }

    // 6. Multi-part file upload
    public String uploadProductImage(UUID productId, MultipartFile file) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Product not found with id: " + productId));

        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        String fileUrl = "/uploads/products/" + fileName;
        product.setImage(fileUrl);
        productRepository.save(product);

        log.info("Uploaded image for product ID {}: {}", productId, fileUrl);
        return fileUrl;
    }
}