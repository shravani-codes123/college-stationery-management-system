package com.college.stationery.controller;

import com.college.stationery.model.Product;
import com.college.stationery.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/{userId}")
    public List<Product> getRecommendations(@PathVariable Long userId) {
        // Simple Logic: 
        // 1. Get Top Selling Products
        // 2. Get some items from diverse categories
        // (In a real system, we would analyze userId's order history)
        
        List<Product> topSelling = productRepository.findTop5ByOrderBySalesCountDesc();
        
        // If we have very few sales, just return some products
        if (topSelling.size() < 3) {
            return productRepository.findAll().stream().limit(6).collect(Collectors.toList());
        }
        
        return topSelling;
    }
}
