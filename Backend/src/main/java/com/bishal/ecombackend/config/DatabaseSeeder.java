package com.bishal.ecombackend.config;

import com.bishal.ecombackend.model.DeliveryOption;
import com.bishal.ecombackend.model.Product;
import com.bishal.ecombackend.repo.DeliveryOptionRepository;
import com.bishal.ecombackend.repo.ProductRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final DeliveryOptionRepository deliveryOptionRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        // Seed Delivery Options if empty
        if (deliveryOptionRepository.count() == 0) {
            deliveryOptionRepository.saveAll(List.of(
                    new DeliveryOption("1", 7, 0),
                    new DeliveryOption("2", 3, 499),
                    new DeliveryOption("3", 1, 999)
            ));
        }

        // Seed Products if empty
        if (productRepository.count() == 0) {
            InputStream inputStream = new ClassPathResource("data/products.json").getInputStream();
            List<Product> products = objectMapper.readValue(inputStream, new TypeReference<>() {});
            productRepository.saveAll(products);
        }
    }
}