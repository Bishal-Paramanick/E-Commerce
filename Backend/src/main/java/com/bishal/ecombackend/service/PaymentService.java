package com.bishal.ecombackend.service;

import com.bishal.ecombackend.dto.PaymentVerificationRequest;
import com.bishal.ecombackend.dto.PaymentVerificationResponse;
import com.bishal.ecombackend.model.Order;
import com.bishal.ecombackend.model.OrderItem;
import com.bishal.ecombackend.model.OrderStatus;
import com.bishal.ecombackend.repo.OrderRepository;
import com.bishal.ecombackend.repo.ProductRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.NoSuchElementException;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final int MIN_AMOUNT_PAISE = 100; // Razorpay minimum is INR 1

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final RazorpayClient razorpayClient;
    private final ObjectMapper objectMapper;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Value("${razorpay.currency:INR}")
    private String currency;

    @Value("${razorpay.webhook.secret:default_webhook_secret}")
    private String webhookSecret;

    /**
     * Creates an order with the Razorpay gateway and returns its id.
     */
    public String createRazorpayOrder(int amountCents, String receiptId) {
        if (amountCents < MIN_AMOUNT_PAISE) {
            throw new IllegalArgumentException("Order total is below the Razorpay minimum of 100 paise (INR 1)");
        }
        try {
            JSONObject options = new JSONObject();
            options.put("amount", amountCents);
            options.put("currency", currency);
            options.put("receipt", receiptId);

            com.razorpay.Order rzpOrder = razorpayClient.orders.create(options);
            return rzpOrder.get("id");
        } catch (RazorpayException e) {
            throw new IllegalStateException("Failed to create Razorpay payment order: " + e.getMessage(), e);
        }
    }

    /**
     * Synchronous browser flow verification
     */
    @Transactional
    public PaymentVerificationResponse verifyPayment(String username, PaymentVerificationRequest request) {
        Order order = orderRepository.findByIdAndUser_Username(request.getOrderId(), username)
                .orElseThrow(() -> new NoSuchElementException("Order not found or unauthorized"));

        if (order.getStatus() == OrderStatus.PAID) {
            return PaymentVerificationResponse.builder()
                    .orderId(order.getId())
                    .status(order.getStatus())
                    .message("Order has already been paid.")
                    .build();
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Order is not awaiting payment (status: " + order.getStatus() + ")");
        }

        if (order.getPaymentOrderId() == null
                || !order.getPaymentOrderId().equals(request.getRazorpayOrderId())) {
            throw new IllegalArgumentException("Razorpay order does not match this order");
        }

        boolean isValid;
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.getRazorpayOrderId());
            options.put("razorpay_payment_id", request.getRazorpayPaymentId());
            options.put("razorpay_signature", request.getRazorpaySignature());
            isValid = Utils.verifyPaymentSignature(options, keySecret);
        } catch (RazorpayException e) {
            throw new IllegalArgumentException("Signature verification failed: " + e.getMessage());
        }

        if (!isValid) {
            throw new IllegalArgumentException("Invalid payment signature.");
        }

        order.setStatus(OrderStatus.PAID);
        order.setPaymentId(request.getRazorpayPaymentId());
        orderRepository.save(order);

        return PaymentVerificationResponse.builder()
                .orderId(order.getId())
                .status(OrderStatus.PAID)
                .message("Payment verified successfully.")
                .build();
    }

    /**
     * Asynchronous Razorpay server-to-server webhook processor
     */
    @Transactional
    public void processWebhook(String rawPayload, String signatureHeader) {
        if (!verifyWebhookSignature(rawPayload, signatureHeader)) {
            log.error("Webhook signature mismatch. Rejecting webhook request.");
            throw new IllegalArgumentException("Invalid webhook signature");
        }

        try {
            JsonNode rootNode = objectMapper.readTree(rawPayload);
            String event = rootNode.path("event").asText();
            log.info("Processing Razorpay webhook event: {}", event);

            JsonNode paymentEntity = rootNode.path("payload").path("payment").path("entity");
            String paymentOrderId = paymentEntity.path("order_id").asText();
            String paymentId = paymentEntity.path("id").asText();

            if (paymentOrderId == null || paymentOrderId.isBlank()) {
                log.warn("Webhook payload does not contain payment order_id. Skipping.");
                return;
            }

            Order order = orderRepository.findByPaymentOrderId(paymentOrderId).orElse(null);
            if (order == null) {
                log.warn("No order found matching paymentOrderId: {}", paymentOrderId);
                return;
            }

            switch (event) {
                case "order.paid":
                case "payment.captured":
                    handlePaymentSuccess(order, paymentId);
                    break;

                case "payment.failed":
                    handlePaymentFailure(order);
                    break;

                default:
                    log.debug("Unhandled webhook event type: {}", event);
                    break;
            }
        } catch (Exception e) {
            log.error("Failed to parse and process webhook payload: {}", e.getMessage(), e);
            throw new IllegalStateException("Error parsing webhook event: " + e.getMessage());
        }
    }

    private void handlePaymentSuccess(Order order, String paymentId) {
        if (order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.PROCESSING
                || order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            log.info("Order {} is already in state {}. Ignoring duplicate payment event.", order.getId(), order.getStatus());
            return;
        }

        order.setPaymentId(paymentId);
        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);
        log.info("Order {} successfully updated to PAID via webhook", order.getId());
    }

    private void handlePaymentFailure(Order order) {
        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CANCELLED);

            for (OrderItem item : order.getProducts()) {
                productRepository.findById(item.getProductId()).ifPresent(product -> {
                    product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                    productRepository.save(product);
                });
            }

            orderRepository.save(order);
            log.info("Order {} marked as CANCELLED and stock restored via payment failure webhook", order.getId());
        }
    }

    private boolean verifyWebhookSignature(String rawPayload, String signatureHeader) {
        if (signatureHeader == null || rawPayload == null) {
            return false;
        }

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);

            byte[] hmacBytes = mac.doFinal(rawPayload.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hmacBytes) {
                sb.append(String.format("%02x", b));
            }
            String calculatedSignature = sb.toString();

            return MessageDigest.isEqual(
                    calculatedSignature.getBytes(StandardCharsets.UTF_8),
                    signatureHeader.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.error("Cryptographic error computing webhook signature: {}", e.getMessage(), e);
            return false;
        }
    }
}