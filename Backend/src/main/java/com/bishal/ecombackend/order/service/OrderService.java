package com.bishal.ecombackend.order.service;

import com.bishal.ecombackend.cart.model.Cart;
import com.bishal.ecombackend.cart.model.CartItem;
import com.bishal.ecombackend.cart.service.CartService;
import com.bishal.ecombackend.common.exception.ResourceNotFoundException;
import com.bishal.ecombackend.delivery.model.DeliveryOption;
import com.bishal.ecombackend.order.dto.CheckoutRequest;
import com.bishal.ecombackend.order.dto.OrderResponse;
import com.bishal.ecombackend.order.mapper.OrderMapper;
import com.bishal.ecombackend.order.model.Order;
import com.bishal.ecombackend.order.model.OrderItem;
import com.bishal.ecombackend.order.model.OrderStatus;
import com.bishal.ecombackend.order.repo.OrderRepository;
import com.bishal.ecombackend.payment.service.PaymentService;
import com.bishal.ecombackend.product.model.Product;
import com.bishal.ecombackend.product.service.ProductService;
import com.bishal.ecombackend.user.model.Users;
import com.bishal.ecombackend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final ProductService productService;
    private final UserService userService;
    private final OrderMapper orderMapper;
    private final PaymentService paymentService;

    @Transactional
    public OrderResponse checkout(String username, CheckoutRequest request) {
        String shippingAddress = resolveShippingAddress(username, request);

        Users user = userService.getUserByUsername(username);

        Cart cart = cartService.getCartWithValidatedItems(username);
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

            // Decrement stock via ProductService
            productService.deductStock(product.getId(), qty);

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

        cartService.clearCartForUser(username);

        return orderMapper.toResponse(savedOrder, true);
    }

    private String resolveShippingAddress(String username, CheckoutRequest request) {
        return userService.resolveShippingAddress(
                username,
                request != null ? request.getAddressId() : null,
                request != null ? request.getShippingAddress() : null
        );
    }

    private void validateStockAvailability(List<CartItem> cartItems) {
        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            if (!productService.hasSufficientStock(product.getId(), item.getQuantity())) {
                throw new IllegalArgumentException("Insufficient inventory for product: "
                        + product.getName() + " (Available: " + product.getStockQuantity() + ")");
            }
        }
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrders(String username, String expand, Pageable pageable) {
        boolean expandProducts = "products".equalsIgnoreCase(expand);
        return orderRepository.findAllByUser_Username(username, pageable)
                .map(order -> orderMapper.toResponse(order, expandProducts));
    }

    @Transactional(readOnly = true)
    public OrderResponse getUserOrderById(String username, UUID orderId, String expand) {
        Order order = orderRepository.findByIdAndUser_Username(orderId, username)
                .orElseThrow(() -> new NoSuchElementException("Order not found or access denied"));
        boolean expandProducts = "products".equalsIgnoreCase(expand);
        return orderMapper.toResponse(order, expandProducts);
    }

    @Transactional
    public OrderResponse cancelOrder(String username, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("You are not authorized to cancel this order");
        }

        if (!order.getStatus().isCancellable()) {
            throw new IllegalStateException("Order cannot be cancelled in its current state: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);

        // Restore inventory for each product via ProductService
        for (OrderItem item : order.getProducts()) {
            productService.restoreStock(item.getProductId(), item.getQuantity());
        }

        Order savedOrder = orderRepository.save(order);
        return orderMapper.toResponse(savedOrder, true);
    }

    // --- Admin Operations ---

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrdersAdmin(String expand, Pageable pageable) {
        boolean expandProducts = "products".equalsIgnoreCase(expand);
        return orderRepository.findAll(pageable)
                .map(order -> orderMapper.toResponse(order, expandProducts));
    }

    @Transactional
    public OrderResponse updateOrderStatusByAdmin(UUID orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getStatus().canTransitionTo(newStatus)) {
            throw new IllegalStateException(
                    String.format("Invalid status transition from %s to %s", order.getStatus(), newStatus)
            );
        }

        if (newStatus == OrderStatus.CANCELLED) {
            for (OrderItem item : order.getProducts()) {
                productService.restoreStock(item.getProductId(), item.getQuantity());
            }
        }

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        return orderMapper.toResponse(updatedOrder, true);
    }
}