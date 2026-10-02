package com.bishal.ecombackend.service;

import com.bishal.ecombackend.dto.*;
import com.bishal.ecombackend.mapper.CartMapper;
import com.bishal.ecombackend.model.Cart;
import com.bishal.ecombackend.model.CartItem;
import com.bishal.ecombackend.model.DeliveryOption;
import com.bishal.ecombackend.model.Product;
import com.bishal.ecombackend.model.Users;
import com.bishal.ecombackend.repo.CartItemRepository;
import com.bishal.ecombackend.repo.CartRepository;
import com.bishal.ecombackend.repo.DeliveryOptionRepository;
import com.bishal.ecombackend.repo.ProductRepository;
import com.bishal.ecombackend.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final DeliveryOptionRepository deliveryOptionRepository;
    private final UserRepo userRepository;
    private final CartMapper cartMapper;

    /**
     * Write path only. Must be called from a read-write transaction.
     * Read-only methods must NOT call this (they use findCart instead).
     */
    @Transactional
    public Cart getOrCreateCart(String username) {
        return cartRepository.findByUserUsername(username)
                .orElseGet(() -> {
                    Users user = userRepository.findByUsername(username);
                    if (user == null) {
                        throw new NoSuchElementException("User not found: " + username);
                    }
                    Cart cart = new Cart();
                    cart.setUser(user);
                    return cartRepository.save(cart);
                });
    }

    /** Read-only lookup: never inserts anything. */
    private Optional<Cart> findCart(String username) {
        return cartRepository.findByUserUsername(username);
    }

    // --- Per-User Operations ---

    @Transactional(readOnly = true)
    public List<CartItemResponse> getCartItems(String username, String expand) {
        Optional<Cart> cartOpt = findCart(username);
        if (cartOpt.isEmpty()) {
            return new ArrayList<>();
        }

        boolean expandProduct = "product".equalsIgnoreCase(expand);
        List<CartItem> items = cartOpt.get().getItems();

        return items.stream()
                .map(item -> cartMapper.toResponse(item, expandProduct))
                .collect(Collectors.toList());
    }

    @Transactional
    public CartItemResponse addToCart(String username, AddToCartRequest request) {
        Cart cart = getOrCreateCart(username);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new NoSuchElementException("Product not found"));

        int incomingQuantity = request.getQuantity();
        if (incomingQuantity > product.getStockQuantity()) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock (" + product.getStockQuantity() + ")");
        }

        String deliveryOptionId = (request.getDeliveryOptionId() != null && !request.getDeliveryOptionId().isBlank())
                ? request.getDeliveryOptionId()
                : "1";

        DeliveryOption deliveryOption = deliveryOptionRepository.findById(deliveryOptionId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid delivery option: " + deliveryOptionId));

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCart_IdAndProduct_Id(cart.getId(), product.getId());
        CartItem cartItem;

        if (existingItemOpt.isPresent()) {
            cartItem = existingItemOpt.get();
            int totalQuantity = cartItem.getQuantity() + incomingQuantity;
            if (totalQuantity > product.getStockQuantity()) {
                throw new IllegalArgumentException("Total quantity in cart would exceed available stock (" + product.getStockQuantity() + ")");
            }
            cartItem.setQuantity(totalQuantity);
        } else {
            cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(incomingQuantity);
            cartItem.setDeliveryOption(deliveryOption);
            cart.addItem(cartItem);
        }

        CartItem saved = cartItemRepository.save(cartItem);
        return cartMapper.toResponse(saved, true);
    }

    @Transactional
    public CartItemResponse updateCartItem(String username, UUID itemId, UpdateCartRequest request) {
        CartItem cartItem = cartItemRepository.findByIdAndCart_User_Username(itemId, username)
                .orElseThrow(() -> new NoSuchElementException("Cart item not found or does not belong to you"));

        if (request.getQuantity() != null) {
            if (request.getQuantity() > cartItem.getProduct().getStockQuantity()) {
                throw new IllegalArgumentException("Requested quantity exceeds available stock (" + cartItem.getProduct().getStockQuantity() + ")");
            }
            cartItem.setQuantity(request.getQuantity());
        }

        if (request.getDeliveryOptionId() != null) {
            DeliveryOption deliveryOption = deliveryOptionRepository.findById(request.getDeliveryOptionId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid delivery option"));
            cartItem.setDeliveryOption(deliveryOption);
        }

        CartItem updated = cartItemRepository.save(cartItem);
        return cartMapper.toResponse(updated, true);
    }

    @Transactional
    public void removeCartItem(String username, UUID itemId) {
        CartItem cartItem = cartItemRepository.findByIdAndCart_User_Username(itemId, username)
                .orElseThrow(() -> new NoSuchElementException("Cart item not found or does not belong to you"));
        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(String username) {
        // Nothing to clear if the user has no cart yet; don't create one just to empty it.
        Optional<Cart> cartOpt = cartRepository.findByUserUsername(username);
        if (cartOpt.isEmpty()) {
            return;
        }
        Cart cart = cartOpt.get();
        cartItemRepository.deleteAllByCart_Id(cart.getId());
        cart.clearItems();
        cartRepository.save(cart);
    }

    @Transactional(readOnly = true)
    public CartSummaryResponse getCartSummary(String username) {
        List<CartItem> items = findCart(username)
                .map(Cart::getItems)
                .orElseGet(ArrayList::new);
        return cartMapper.toSummaryResponse(items);
    }

    // --- Overloaded Fallback Methods for Legacy Controllers ---

    @Transactional(readOnly = true)
    public List<CartItemResponse> getCartItems(String expand) {
        List<CartItem> items = cartItemRepository.findAll();
        boolean expandProduct = "product".equalsIgnoreCase(expand);
        return items.stream()
                .map(item -> cartMapper.toResponse(item, expandProduct))
                .collect(Collectors.toList());
    }

    @Transactional
    public CartItemResponse addToCart(AddToCartRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new NoSuchElementException("Product not found"));

        DeliveryOption defaultOption = deliveryOptionRepository.findById("1")
                .orElseThrow(() -> new IllegalStateException("Default delivery option '1' not configured"));

        Optional<CartItem> existingItem = cartItemRepository.findAll().stream()
                .filter(item -> item.getProduct().getId().equals(request.getProductId()))
                .findFirst();

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

    @Transactional
    public CartItemResponse updateCartItem(UUID productId, UpdateCartRequest request) {
        CartItem cartItem = cartItemRepository.findAll().stream()
                .filter(item -> item.getProduct().getId().equals(productId) || item.getId().equals(productId))
                .findFirst()
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

    @Transactional
    public void removeCartItem(UUID productId) {
        CartItem cartItem = cartItemRepository.findAll().stream()
                .filter(item -> item.getProduct().getId().equals(productId) || item.getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException("Cart item not found"));
        cartItemRepository.delete(cartItem);
    }

    @Transactional(readOnly = true)
    public CartSummaryResponse getCartSummary() {
        List<CartItem> cartItems = cartItemRepository.findAll();
        return cartMapper.toSummaryResponse(cartItems);
    }
}