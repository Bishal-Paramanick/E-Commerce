package com.bishal.ecombackend.service;

import com.bishal.ecombackend.dto.OrderResponse;
import com.bishal.ecombackend.mapper.OrderMapper;
import com.bishal.ecombackend.model.CartItem;
import com.bishal.ecombackend.model.DeliveryOption;
import com.bishal.ecombackend.model.Order;
import com.bishal.ecombackend.model.OrderItem;
import com.bishal.ecombackend.model.Product;
import com.bishal.ecombackend.repo.CartItemRepository;
import com.bishal.ecombackend.repo.OrderRepository;
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
    private final CartItemRepository cartItemRepository;
    private final OrderMapper orderMapper;

    public List<OrderResponse> getAllOrders(String expand) {
        List<Order> orders = orderRepository.findAllByOrderByOrderTimeMsDesc();
        boolean expandProducts = "products".equalsIgnoreCase(expand);

        return orders.stream()
                .map(order -> orderMapper.toResponse(order, expandProducts))
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(UUID orderId, String expand) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order not found with id: " + orderId));

        boolean expandProducts = "products".equalsIgnoreCase(expand);
        return orderMapper.toResponse(order, expandProducts);
    }

    @Transactional
    public OrderResponse placeOrder() {
        List<CartItem> cartItems = cartItemRepository.findAll();
        if (cartItems.isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }

        long now = System.currentTimeMillis();
        int rawTotalCostCents = 0;
        List<OrderItem> orderProducts = new ArrayList<>();

        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            DeliveryOption deliveryOption = item.getDeliveryOption();

            int productCost = product.getPriceCents() * item.getQuantity();
            int shippingCost = deliveryOption.getPriceCents();
            rawTotalCostCents += (productCost + shippingCost);

            long estimatedDeliveryTimeMs = now + (deliveryOption.getDeliveryDays() * 24L * 60 * 60 * 1000);

            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(product.getId());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setEstimatedDeliveryTimeMs(estimatedDeliveryTimeMs);

            orderProducts.add(orderItem);
        }

        int totalCostCents = (int) Math.round(rawTotalCostCents * 1.10);

        Order order = new Order();
        order.setOrderTimeMs(now);
        order.setTotalCostCents(totalCostCents);
        order.setProducts(orderProducts);

        Order savedOrder = orderRepository.save(order);
        cartItemRepository.deleteAll();

        return orderMapper.toResponse(savedOrder, false);
    }
}