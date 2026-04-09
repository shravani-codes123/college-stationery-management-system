package com.college.stationery.controller;

import com.college.stationery.model.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*") // Allows frontend to call this
public class ProductController {

    @Autowired
    private com.college.stationery.service.ProductService productService;

    // Get ALL Products
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    // Add a new product (For Manager)
    @PostMapping
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        try {
            Product savedProduct = productService.saveProduct(product);
            return ResponseEntity.status(201).body(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Update product (restock, price, etc.)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable("id") Long id, @RequestBody Product details) {
        try {
            return productService.updateProduct(id, details)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating product: " + e.getMessage());
        }
    }

    // Get Low Stock Products
    @GetMapping("/low-stock")
    public List<Product> getLowStockProducts(@RequestParam(name = "threshold", defaultValue = "10") Integer threshold) {
        return productService.getLowStockProducts(threshold);
    }

    // Delete product
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }
}
