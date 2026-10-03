package com.bishal.ecombackend.service;

import com.bishal.ecombackend.dto.PaymentVerificationRequest;
import com.bishal.ecombackend.dto.PaymentVerificationResponse;
import com.bishal.ecombackend.model.Order;
import com.bishal.ecombackend.model.OrderStatus;
import com.bishal.ecombackend.repo.OrderRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final int MIN_AMOUNT_PAISE = 100; // Razorpay minimum is INR 1

    private final OrderRepository orderRepository;
    private final RazorpayClient razorpayClient; // bean from RazorpayConfig

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Value("${razorpay.currency:INR}")
    private String currency;

    /**
     * Creates an order with the Razorpay gateway and returns its id.
     */
    public String createRazorpayOrder(int amountCents, String receiptId) {
        if (amountCents < MIN_AMOUNT_PAISE) {
            throw new IllegalArgumentException("Order total is below the Razorpay minimum of 100 paise (INR 1)");
        }
        try {
            JSONObject options = new JSONObject();
            options.put("amount", amountCents); // smallest currency unit (paise)
            options.put("currency", currency);
            options.put("receipt", receiptId);

            com.razorpay.Order rzpOrder = razorpayClient.orders.create(options);
            return rzpOrder.get("id");
        } catch (RazorpayException e) {
            throw new IllegalStateException("Failed to create Razorpay payment order: " + e.getMessage(), e);
        }
    }

    /**
     * Verifies the HMAC-SHA256 signature and marks the order as PAID.
     * An invalid signature is rejected but does NOT change the order status,
     * so the customer can retry payment on the same Razorpay order.
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

        // SECURITY: the Razorpay order must be the one created for THIS order.
        // Without this check, a valid payment for a cheap order could be replayed
        // against an expensive one.
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
}