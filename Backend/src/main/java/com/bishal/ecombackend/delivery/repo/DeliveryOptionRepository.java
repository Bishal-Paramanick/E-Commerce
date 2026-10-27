package com.bishal.ecombackend.delivery.repo;

import com.bishal.ecombackend.delivery.model.DeliveryOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeliveryOptionRepository extends JpaRepository<DeliveryOption, String> {
}