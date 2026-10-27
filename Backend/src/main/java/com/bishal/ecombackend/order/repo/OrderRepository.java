package com.bishal.ecombackend.order.repo;

import com.bishal.ecombackend.order.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    // Eagerly joins the user association in a single query (eliminates N+1 on Order.user)
    @EntityGraph(attributePaths = {"user"})
    Page<Order> findAllByUser_Username(@Param("username") String username, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.id = :orderId AND o.user.username = :username")
    Optional<Order> findByIdAndUser_Username(@Param("orderId") UUID orderId, @Param("username") String username);

    // Eagerly joins the user association in a single query (eliminates N+1 on Order.user)
    @EntityGraph(attributePaths = {"user"})
    Page<Order> findAll(Pageable pageable);

    // Required for Razorpay Webhook lookups
    Optional<Order> findByPaymentOrderId(String paymentOrderId);
}