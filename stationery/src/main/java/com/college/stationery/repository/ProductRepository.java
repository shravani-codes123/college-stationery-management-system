package com.college.stationery.repository;

import com.college.stationery.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByQuantityLessThan(int threshold);
    Optional<Product> findByName(String name);
    
    @Query("SELECT p FROM Product p WHERE " +
           "(:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:category IS NULL OR p.category = :category) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:hasDiscount IS FALSE OR p.discount > 0)")
    List<Product> filterProducts(String name, String category, Double minPrice, Double maxPrice, Boolean hasDiscount);

    List<Product> findTop5ByOrderBySalesCountDesc();
}
