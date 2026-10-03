package com.bishal.ecombackend.controller;

import com.bishal.ecombackend.dto.ProductDTO;
import com.bishal.ecombackend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // Paginated & Filtered Product Listing
    @GetMapping
    public ResponseEntity<Page<ProductDTO>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Integer minPriceCents,
            @RequestParam(required = false) Integer maxPriceCents,
            @RequestParam(required = false) Boolean inStock,
            @PageableDefault(page = 0, size = 10, sort = "createdAt") Pageable pageable) {

        return ResponseEntity.ok(productService.getProducts(
                search, categoryId, brand, minPriceCents, maxPriceCents, inStock, pageable
        ));
    }

    // Get Single Product by UUID
    @GetMapping("/{productId}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable UUID productId) {
        return ResponseEntity.ok(productService.getProductById(productId));
    }

    // Create New Product (Admin Protected)
    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(dto));
    }

    // Update Product (Admin Protected)
    @PutMapping("/{productId}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable UUID productId,
            @Valid @RequestBody ProductDTO dto) {
        return ResponseEntity.ok(productService.updateProduct(productId, dto));
    }

    // Delete Product (Admin Protected)
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }

    // Upload Product Image (Admin Protected)
    @PostMapping("/{productId}/image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @PathVariable UUID productId,
            @RequestParam("file") MultipartFile file) throws IOException {

        String imageUrl = productService.uploadProductImage(productId, file);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }
}