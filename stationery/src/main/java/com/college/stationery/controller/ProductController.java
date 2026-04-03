package com.college.stationery.controller;

import com.college.stationery.model.Product;
import com.college.stationery.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*") // Allows frontend to call this
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    // Get ALL Products
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Add a new product (For Manager)
    @PostMapping
    public Product addProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    // Update product (restock, price, etc.)
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product details) {
        return productRepository.findById(id).map(prod -> {
            prod.setName(details.getName());
            prod.setCategory(details.getCategory());
            prod.setPrice(details.getPrice());
            prod.setQuantity(details.getQuantity());
            prod.setDiscount(details.getDiscount());
            return ResponseEntity.ok(productRepository.save(prod));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Delete product
    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
    }
}
