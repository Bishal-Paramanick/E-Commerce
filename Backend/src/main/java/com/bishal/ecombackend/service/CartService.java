package com.bishal.ecombackend.service;

import com.bishal.ecombackend.dto.AddToCartRequest;
import com.bishal.ecombackend.dto.CartItemResponse;
import com.bishal.ecombackend.dto.CartSummaryResponse;
import com.bishal.ecombackend.dto.UpdateCartRequest;
import com.bishal.ecombackend.mapper.CartMapper;
import com.bishal.ecombackend.model.CartItem;
import com.bishal.ecombackend.model.DeliveryOption;
import com.bishal.ecombackend.model.Product;
import com.bishal.ecombackend.repo.CartItemRepository;
import com.bishal.ecombackend.repo.DeliveryOptionRepository;
import com.bishal.ecombackend.repo.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final DeliveryOptionRepository deliveryOptionRepository;
    private final CartMapper cartMapper;

    public List<CartItemResponse> getCartItems(String expand) {
        List<CartItem> cartItems = cartItemRepository.findAll();
        boolean expandProduct = "product".equalsIgnoreCase(expand);

        return cartItems.stream()
                .map(item -> cartMapper.toResponse(item, expandProduct))
                .collect(Collectors.toList());
    }

    public CartItemResponse addToCart(AddToCartRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        DeliveryOption defaultOption = deliveryOptionRepository.findById("1")
                .orElseThrow(() -> new IllegalStateException("Default delivery option '1' not configured"));

        Optional<CartItem> existingItem = cartItemRepository.findByProduct_Id(request.getProductId());
        CartItem cartItem;

        if (existingItem.isPresent()) {
            cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        } else {
            cartItem = new CartItem();
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());
            cartItem.setDeliveryOption(defaultOption);
        }

        CartItem saved = cartItemRepository.save(cartItem);
        return cartMapper.toResponse(saved, false);
    }

    public CartItemResponse updateCartItem(UUID productId, UpdateCartRequest request) {
        CartItem cartItem = cartItemRepository.findByProduct_Id(productId)
                .orElseThrow(() -> new NoSuchElementException("Cart item not found"));

        if (request.getQuantity() != null) {
            cartItem.setQuantity(request.getQuantity());
        }

        if (request.getDeliveryOptionId() != null) {
            DeliveryOption deliveryOption = deliveryOptionRepository.findById(request.getDeliveryOptionId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid delivery option"));
            cartItem.setDeliveryOption(deliveryOption);
        }

        CartItem updated = cartItemRepository.save(cartItem);
        return cartMapper.toResponse(updated, false);
    }

    public void removeCartItem(UUID productId) {
        CartItem cartItem = cartItemRepository.findByProduct_Id(productId)
                .orElseThrow(() -> new NoSuchElementException("Cart item not found"));
        cartItemRepository.delete(cartItem);
    }

    public CartSummaryResponse getCartSummary() {
        List<CartItem> cartItems = cartItemRepository.findAll();
        return cartMapper.toSummaryResponse(cartItems);
    }
}