package com.bishal.ecombackend.delivery.service;

import com.bishal.ecombackend.delivery.dto.DeliveryOptionResponse;
import com.bishal.ecombackend.delivery.mapper.DeliveryOptionMapper;
import com.bishal.ecombackend.delivery.model.DeliveryOption;
import com.bishal.ecombackend.delivery.repo.DeliveryOptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryOptionService {

    private final DeliveryOptionRepository deliveryOptionRepository;
    private final DeliveryOptionMapper deliveryOptionMapper;

    public List<DeliveryOptionResponse> getDeliveryOptions(String expand) {
        List<DeliveryOption> options = deliveryOptionRepository.findAll();
        boolean expandTime = "estimatedDeliveryTime".equalsIgnoreCase(expand);

        return options.stream()
                .map(opt -> deliveryOptionMapper.toResponse(opt, expandTime))
                .collect(Collectors.toList());
    }
}