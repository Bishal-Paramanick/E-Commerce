package com.bishal.ecombackend.service;

import com.bishal.ecombackend.model.Address;
import com.bishal.ecombackend.model.Cart;
import com.bishal.ecombackend.model.Product;
import com.bishal.ecombackend.model.Users;
import com.bishal.ecombackend.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DatabaseResetService {

    private final CartItemRepository cartItemRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final AddressRepository addressRepository;
    private final UserRepo userRepo;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void resetAndSeedDatabase() {
        performSystemReset();
    }

    @Transactional
    public void performSystemReset() {
        List<String> coreUsernames = List.of("bishal", "admin");

        // 1. Clear all orders & order products
        orderRepository.deleteAll();

        // 2. Clear all cart items
        cartItemRepository.deleteAll();

        // 3. Purge carts for non-core users; reset carts for core users
        List<Cart> allCarts = cartRepository.findAll();
        for (Cart cart : allCarts) {
            if (cart.getUser() == null || !coreUsernames.contains(cart.getUser().getUsername())) {
                cartRepository.delete(cart);
            } else {
                cart.clearItems();
                cartRepository.save(cart);
            }
        }

        // 4. Purge addresses: remove all addresses for non-core users, and purge non-default addresses for core users
        List<Address> allAddresses = addressRepository.findAll();
        for (Address addr : allAddresses) {
            if (addr.getUser() == null || !coreUsernames.contains(addr.getUser().getUsername())) {
                addressRepository.delete(addr);
            } else if (!addr.isDefault()) {
                addressRepository.delete(addr);
            }
        }

        // 5. Purge dynamically registered users; preserve core baseline users
        List<Users> users = userRepo.findAll();
        for (Users user : users) {
            if (!coreUsernames.contains(user.getUsername())) {
                userRepo.delete(user);
            }
        }

        // 6. Ensure baseline core users exist with valid carts
        Users bishal = userRepo.findByUsername("bishal");
        if (bishal == null) {
            bishal = new Users("bishal", "bishal@example.com", passwordEncoder.encode("bishal123"), "ROLE_USER");
            userRepo.save(bishal);
        }
        if (cartRepository.findByUserUsername("bishal").isEmpty()) {
            Cart cart = new Cart();
            cart.setUser(bishal);
            cartRepository.save(cart);
        }

        Users admin = userRepo.findByUsername("admin");
        if (admin == null) {
            admin = new Users("admin", "admin@example.com", passwordEncoder.encode("admin123"), "ROLE_ADMIN");
            userRepo.save(admin);
        }
        if (cartRepository.findByUserUsername("admin").isEmpty()) {
            Cart cart = new Cart();
            cart.setUser(admin);
            cartRepository.save(cart);
        }

        // 7. Reset product inventory quantities back to baseline defaults (50 units each)
        List<Product> products = productRepository.findAll();
        for (Product p : products) {
            p.setStockQuantity(50);
        }
        productRepository.saveAll(products);
    }
}