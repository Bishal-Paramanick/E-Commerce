package com.bishal.ecombackend.repo;

import com.bishal.ecombackend.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    Optional<CartItem> findByCart_IdAndProduct_Id(Long cartId, UUID productId);

    Optional<CartItem> findByIdAndCart_User_Username(UUID itemId, String username);

    void deleteAllByCart_Id(Long cartId);
}