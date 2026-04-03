package com.college.stationery.repository;

import com.college.stationery.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByNameAndUserId(String name, Long userId);
    void deleteByUserId(Long userId);
}
