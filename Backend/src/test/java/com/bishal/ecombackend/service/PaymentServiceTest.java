package com.bishal.ecombackend.service;

import com.bishal.ecombackend.model.Order;
import com.bishal.ecombackend.model.OrderStatus;
import com.bishal.ecombackend.repo.OrderRepository;
import com.bishal.ecombackend.repo.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.razorpay.RazorpayClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private RazorpayClient razorpayClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private PaymentService paymentService;

    private final String webhookSecret = "test_webhook_secret_key_123";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentService, "webhookSecret", webhookSecret);
        ReflectionTestUtils.setField(paymentService, "objectMapper", objectMapper);
    }

    private String calculateHmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : rawHmac) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    @Test
    @DisplayName("Should successfully process valid order.paid webhook and mark order as PAID")
    void testProcessWebhook_ValidSignature_MarksOrderAsPaid() throws Exception {
        String paymentOrderId = "order_rzp_123456";
        String payload = """
            {
              "event": "order.paid",
              "payload": {
                "payment": {
                  "entity": {
                    "id": "pay_987654",
                    "order_id": "%s"
                  }
                }
              }
            }
            """.formatted(paymentOrderId);

        String validSignature = calculateHmacSha256(payload, webhookSecret);

        Order pendingOrder = Order.builder()
                .status(OrderStatus.PENDING)
                .paymentOrderId(paymentOrderId)
                .build();
        ReflectionTestUtils.setField(pendingOrder, "id", UUID.randomUUID());

        when(orderRepository.findByPaymentOrderId(paymentOrderId)).thenReturn(Optional.of(pendingOrder));

        paymentService.processWebhook(payload, validSignature);

        assertEquals(OrderStatus.PAID, pendingOrder.getStatus());
        assertEquals("pay_987654", pendingOrder.getPaymentId());
        verify(orderRepository, times(1)).save(pendingOrder);
    }

    @Test
    @DisplayName("Should reject webhook with invalid signature and throw IllegalArgumentException")
    void testProcessWebhook_InvalidSignature_ThrowsException() {
        String payload = "{\"event\":\"order.paid\"}";
        String invalidSignature = "invalid_hex_digest_value";

        assertThrows(IllegalArgumentException.class, () ->
                paymentService.processWebhook(payload, invalidSignature)
        );

        verifyNoInteractions(orderRepository);
    }
}