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

    // Get ALL Products with optional filtering
    @GetMapping
    public List<Product> getAllProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean discount) {
        
        if (name != null || category != null || minPrice != null || maxPrice != null || discount != null) {
            return productService.searchAndFilterProducts(name, category, minPrice, maxPrice, discount);
        }
        return productService.getAllProducts();
    }

    // Get products with LOW STOCK
    @GetMapping("/low-stock")
    public List<Product> getLowStock(@RequestParam(defaultValue = "10") int threshold) {
        return productService.getLowStockProducts(threshold);
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
