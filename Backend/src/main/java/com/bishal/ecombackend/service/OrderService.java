package com.bishal.ecombackend.service;

import com.bishal.ecombackend.dto.CheckoutRequest;
import com.bishal.ecombackend.dto.OrderResponse;
import com.bishal.ecombackend.dto.UpdateOrderStatusRequest;
import com.bishal.ecombackend.mapper.OrderMapper;
import com.bishal.ecombackend.model.*;
import com.bishal.ecombackend.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepo userRepository;
    private final OrderMapper orderMapper;
    private final PaymentService paymentService;

    @Transactional
    public OrderResponse checkout(String username, CheckoutRequest request) {
        String shippingAddress = (request != null && request.getShippingAddress() != null && !request.getShippingAddress().isBlank())
                ? request.getShippingAddress()
                : "Default Shipping Address";

        Users user = userRepository.findByUsername(username);
        if (user == null) {
            throw new NoSuchElementException("User not found: " + username);
        }

        Cart cart = getCartWithValidatedItems(username);
        List<CartItem> cartItems = cart.getItems();

        validateStockAvailability(cartItems);

        long now = System.currentTimeMillis();
        int productCostCents = 0;
        int shippingCostCents = 0;
        List<OrderItem> orderProducts = new ArrayList<>();

        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            DeliveryOption deliveryOption = item.getDeliveryOption();
            int qty = item.getQuantity();
            int unitPrice = product.getPriceCents();
            int subtotal = unitPrice * qty;

            productCostCents += subtotal;
            if (deliveryOption != null && deliveryOption.getPriceCents() != null) {
                shippingCostCents += deliveryOption.getPriceCents();
            }

            // Decrement stock
            product.setStockQuantity(product.getStockQuantity() - qty);
            productRepository.save(product);

            long deliveryDays = (deliveryOption != null && deliveryOption.getDeliveryDays() != null)
                    ? deliveryOption.getDeliveryDays()
                    : 3L;
            long estimatedDeliveryTimeMs = now + (deliveryDays * 24L * 60 * 60 * 1000);

            OrderItem orderItem = OrderItem.builder()
                    .productId(product.getId())
                    .quantity(qty)
                    .unitPriceCents(unitPrice)
                    .subtotalCents(subtotal)
                    .deliveryOptionId(deliveryOption != null ? deliveryOption.getId() : "1")
                    .estimatedDeliveryTimeMs(estimatedDeliveryTimeMs)
                    .build();

            orderProducts.add(orderItem);
        }

        int totalBeforeTaxCents = productCostCents + shippingCostCents;
        int taxCents = (int) Math.round(totalBeforeTaxCents * 0.10);
        int totalCostCents = totalBeforeTaxCents + taxCents;

        // Create the Razorpay gateway order (throws if the amount is invalid,
        // which rolls back the stock changes above)
        String paymentOrderId = paymentService.createRazorpayOrder(
                totalCostCents,
                "rcpt_" + now
        );

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .orderTimeMs(now)
                .shippingAddress(shippingAddress)
                .shippingCostCents(shippingCostCents)
                .taxCents(taxCents)
                .totalCostCents(totalCostCents)
                .paymentOrderId(paymentOrderId)
                .products(orderProducts)
                .build();

        Order savedOrder = orderRepository.save(order);

        // Clear only this user's cart
        cartItemRepository.deleteAllByCart_Id(cart.getId());
        cart.clearItems();
        cartRepository.save(cart);

        return orderMapper.toResponse(savedOrder, true);
    }

    private Cart getCartWithValidatedItems(String username) {
        Cart cart = cartRepository.findByUserUsername(username)
                .orElseThrow(() -> new IllegalStateException("Cart not found for user: " + username));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot checkout with an empty cart");
        }
        return cart;
    }

    private void validateStockAvailability(List<CartItem> cartItems) {
        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException("Insufficient inventory for product: "
                        + product.getName() + " (Available: " + product.getStockQuantity() + ")");
            }
        }
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(String username, String expand) {
        boolean expandProducts = "products".equalsIgnoreCase(expand);
        return orderRepository.findAllByUser_UsernameOrderByOrderTimeMsDesc(username).stream()
                .map(order -> orderMapper.toResponse(order, expandProducts))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getUserOrderById(String username, UUID orderId, String expand) {
        Order order = orderRepository.findByIdAndUser_Username(orderId, username)
                .orElseThrow(() -> new NoSuchElementException("Order not found or access denied"));
        boolean expandProducts = "products".equalsIgnoreCase(expand);
        return orderMapper.toResponse(order, expandProducts);
    }

    // --- Admin Operations ---

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrdersAdmin(String expand) {
        boolean expandProducts = "products".equalsIgnoreCase(expand);
        return orderRepository.findAllByOrderByOrderTimeMsDesc().stream()
                .map(order -> orderMapper.toResponse(order, expandProducts))
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateOrderStatusAdmin(UUID orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order not found: " + orderId));

        if (request != null && request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }

        Order updated = orderRepository.save(order);
        return orderMapper.toResponse(updated, true);
    }
}