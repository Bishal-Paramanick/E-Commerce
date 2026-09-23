package com.bishal.ecombackend.service;

import com.bishal.ecombackend.repo.CartItemRepository;
import com.bishal.ecombackend.repo.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DatabaseResetService {

    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public void resetAndSeedDatabase() {
        cartItemRepository.deleteAll();
        orderRepository.deleteAll();
    }
}