package com.bishal.ecombackend.cart.repo;

import com.bishal.ecombackend.cart.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    Optional<CartItem> findByCart_IdAndProduct_Id(Long cartId, UUID productId);

    Optional<CartItem> findByIdAndCart_User_Username(UUID itemId, String username);

    Optional<CartItem> findFirstByProduct_Id(UUID productId);

    Optional<CartItem> findFirstByIdOrProduct_Id(UUID id, UUID productId);

    void deleteAllByCart_Id(Long cartId);
}