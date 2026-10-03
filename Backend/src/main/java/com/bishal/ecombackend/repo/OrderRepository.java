package com.bishal.ecombackend.repo;

import com.bishal.ecombackend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    // Retrieve all orders for a specific user ordered by newest first
    @Query("SELECT o FROM Order o WHERE o.user.username = :username ORDER BY o.orderTimeMs DESC")
    List<Order> findAllByUser_UsernameOrderByOrderTimeMsDesc(@Param("username") String username);

    // Retrieve a single order verifying ownership
    @Query("SELECT o FROM Order o WHERE o.id = :orderId AND o.user.username = :username")
    Optional<Order> findByIdAndUser_Username(@Param("orderId") UUID orderId, @Param("username") String username);

    // Admin endpoint: retrieve all orders system-wide
    List<Order> findAllByOrderByOrderTimeMsDesc();
}