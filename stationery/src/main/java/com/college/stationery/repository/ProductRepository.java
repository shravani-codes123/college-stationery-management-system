package com.college.stationery.repository;

import com.college.stationery.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
<<<<<<< HEAD
    List<Product> findByQuantityLessThan(Integer threshold);
=======
    List<Product> findByQuantityLessThan(int threshold);
>>>>>>> 23355cab09eae0e58fd8387d75e339331ffbf49d
    Optional<Product> findByName(String name);
}
