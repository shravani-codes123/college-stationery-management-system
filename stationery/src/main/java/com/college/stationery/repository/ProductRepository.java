package com.college.stationery.repository;

import com.college.stationery.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByQuantityLessThan(Integer threshold);
    Optional<Product> findByName(String name);
}
