package com.college.stationery.controller;

import com.college.stationery.model.Order;
import com.college.stationery.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*") // Allow frontend communication
public class OrderController {

    @Autowired
    private com.college.stationery.repository.OrderRepository orderRepository;

    @Autowired
    private com.college.stationery.repository.CartItemRepository cartItemRepository;

    @Autowired
    private com.college.stationery.repository.ProductRepository productRepository;

    // Place NEW Order (Student Checkout)
    @PostMapping("/checkout")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> placeOrder(@RequestBody Order order) {
        // 1. Fetch Cart Items for the student (Default User ID 1)
        java.util.List<com.college.stationery.model.CartItem> cartItems = cartItemRepository.findAll();
        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body("Cart is empty");
        }

        // 2. Update Inventory for each item
        for (com.college.stationery.model.CartItem item : cartItems) {
            java.util.Optional<com.college.stationery.model.Product> productOpt = productRepository.findByName(item.getName());
            if (productOpt.isPresent()) {
                com.college.stationery.model.Product product = productOpt.get();
                if (product.getQuantity() < item.getQuantity()) {
                    return ResponseEntity.badRequest().body("Insufficient stock for: " + item.getName());
                }
                product.setQuantity(product.getQuantity() - item.getQuantity());
                productRepository.save(product);
            }
        }

        // 3. Clear the Cart
        cartItemRepository.deleteAll();

        // 4. Save the Order
        order.setStatus("PENDING");
        Order savedOrder = orderRepository.save(order);
        return ResponseEntity.ok(savedOrder);
    }

    // Update Order Status (For Manager)
    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable("id") Long id, @RequestParam(name = "status") String status) {
        return orderRepository.findById(id).map(order -> {
            order.setStatus(status.toUpperCase());
            return ResponseEntity.ok(orderRepository.save(order));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Get ALL Orders (For Manager tracking)
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
