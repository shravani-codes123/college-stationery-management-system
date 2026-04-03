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
    private OrderRepository orderRepository;

    // Place NEW Order (Student Checkout)
    @PostMapping("/checkout")
    public ResponseEntity<Order> placeOrder(@RequestBody Order order) {
        order.setStatus("PENDING");
        return ResponseEntity.ok(orderRepository.save(order));
    }

    // Get ALL Orders (For Manager tracking)
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
