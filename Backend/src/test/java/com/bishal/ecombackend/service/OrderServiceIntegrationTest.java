package com.bishal.ecombackend.service;

import com.bishal.ecombackend.dto.CheckoutRequest;
import com.bishal.ecombackend.dto.OrderResponse;
import com.bishal.ecombackend.model.*;
import com.bishal.ecombackend.repo.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class OrderServiceIntegrationTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private DeliveryOptionRepository deliveryOptionRepository;

    @MockitoBean
    private PaymentService paymentService;

    private final String testUser = "integration_tester";
    private UUID testProductId;

    @BeforeEach
    void setUp() {
        when(paymentService.createRazorpayOrder(anyInt(), anyString())).thenReturn("order_fake_rzp_id");

        // 1. Ensure DeliveryOption "1" exists with integer deliveryDays
        if (!deliveryOptionRepository.existsById("1")) {
            DeliveryOption deliveryOption = new DeliveryOption();
            deliveryOption.setId("1");
            deliveryOption.setDeliveryDays(3);
            deliveryOption.setPriceCents(0);
            deliveryOptionRepository.save(deliveryOption);
        }

        // 2. Setup Test User
        Users user = new Users(testUser, "hashed_pw", "ROLE_USER");
        userRepository.save(user);

        // 3. Setup Test Product
        testProductId = UUID.randomUUID();
        Product product = new Product();
        product.setId(testProductId);
        product.setName("Mechanical Keyboard");
        product.setImage("/uploads/keyboard.png");
        product.setPriceCents(5000);
        product.setStockQuantity(10);
        productRepository.save(product);

        // 4. Setup Cart & CartItem
        Cart cart = new Cart();
        cart.setUser(user);
        cart.setItems(new ArrayList<>());
        cartRepository.save(cart);

        CartItem cartItem = new CartItem();
        cartItem.setCart(cart);
        cartItem.setProduct(product);
        cartItem.setQuantity(2);
        cartItem.setDeliveryOption(deliveryOptionRepository.findById("1").orElse(null));
        cartItemRepository.save(cartItem);

        cart.getItems().add(cartItem);
        cartRepository.save(cart);
    }

    @Test
    @DisplayName("Checkout should atomically decrement stock, clear the cart, and create an order")
    void testCheckout_DecrementsStock_AndClearsCart() {
        CheckoutRequest request = CheckoutRequest.builder()
                .shippingAddress("123 Main Street, Sector 5, Salt Lake, Kolkata")
                .build();

        OrderResponse response = orderService.checkout(testUser, request);

        assertNotNull(response);
        assertEquals(OrderStatus.PENDING, response.getStatus());

        Product updatedProduct = productRepository.findById(testProductId).orElseThrow();
        assertEquals(8, updatedProduct.getStockQuantity());

        Cart cart = cartRepository.findByUserUsername(testUser).orElseThrow();
        assertTrue(cart.getItems().isEmpty());
    }

    @Test
    @DisplayName("Checkout should throw IllegalArgumentException when quantity exceeds available stock")
    void testCheckout_InsufficientStock_ThrowsException() {
        Product product = productRepository.findById(testProductId).orElseThrow();
        product.setStockQuantity(1);
        productRepository.save(product);

        CheckoutRequest request = CheckoutRequest.builder()
                .shippingAddress("123 Main Street")
                .build();

        assertThrows(IllegalArgumentException.class, () ->
                orderService.checkout(testUser, request)
        );
    }
}