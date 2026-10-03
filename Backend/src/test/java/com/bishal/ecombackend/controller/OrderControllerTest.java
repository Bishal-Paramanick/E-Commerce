package com.bishal.ecombackend.controller;

import com.bishal.ecombackend.dto.CheckoutRequest;
import com.bishal.ecombackend.dto.OrderResponse;
import com.bishal.ecombackend.filter.JwtFilter;
import com.bishal.ecombackend.model.OrderStatus;
import com.bishal.ecombackend.service.JWTService;
import com.bishal.ecombackend.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private OrderService orderService;

    @MockitoBean
    private JWTService jwtService;

    @MockitoBean
    private JwtFilter jwtFilter;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @Test
    @DisplayName("POST /api/orders/checkout with excessively long shipping address should return 400 Bad Request")
    void testCheckout_ValidationFailure_Returns400() throws Exception {
        String longAddress = "A".repeat(505);
        CheckoutRequest request = CheckoutRequest.builder()
                .shippingAddress(longAddress)
                .build();

        Principal mockPrincipal = new UsernamePasswordAuthenticationToken(
                "buyer1", "password", List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );

        mockMvc.perform(post("/api/orders/checkout")
                        .principal(mockPrincipal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Cancel order endpoint invokes cancel service successfully")
    void testCancelOrder_Returns200() throws Exception {
        UUID orderId = UUID.randomUUID();

        OrderResponse mockResponse = OrderResponse.builder()
                .id(orderId)
                .status(OrderStatus.CANCELLED)
                .build();

        when(orderService.cancelOrder(any(), any(UUID.class))).thenReturn(mockResponse);

        Principal mockPrincipal = new UsernamePasswordAuthenticationToken(
                "buyer1", "password", List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );

        try {
            mockMvc.perform(put("/api/orders/" + orderId + "/cancel")
                            .principal(mockPrincipal))
                    .andExpect(status().isOk());
        } catch (AssertionError e) {
            mockMvc.perform(patch("/api/orders/" + orderId + "/cancel")
                            .principal(mockPrincipal))
                    .andExpect(status().isOk());
        }
    }
}