package com.college.stationery.controller;

import com.college.stationery.model.Order;
import com.college.stationery.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*") // Allow frontend communication
public class OrderController {

    private static final Logger logger = Logger.getLogger(OrderController.class.getName());

    @Autowired
    private com.college.stationery.repository.OrderRepository orderRepository;

    @Autowired
    private com.college.stationery.repository.CartItemRepository cartItemRepository;

    @Autowired
    private com.college.stationery.repository.ProductRepository productRepository;

    @Autowired
    private com.college.stationery.repository.ProductRepository productRepository;

    @Autowired
    private com.college.stationery.repository.CartItemRepository cartItemRepository;

    @Autowired
    private com.college.stationery.service.EmailService emailService;

    @Autowired
    private com.college.stationery.repository.NotificationRepository notificationRepository;

    @Autowired
    private com.college.stationery.repository.UserRepository userRepository;

    // Place NEW Order (Student Checkout)
    @PostMapping("/checkout")
<<<<<<< HEAD
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
=======
    @Transactional
    public ResponseEntity<com.college.stationery.model.Order> placeOrder(@RequestBody com.college.stationery.model.Order order) {
        logger.info("Processing checkout: totalPrice=" + order.getTotalPrice());
        
        // 1. Fetch current cart from database
        java.util.List<com.college.stationery.model.CartItem> cartItems = cartItemRepository.findAll();
        
        if (cartItems.isEmpty()) {
            logger.warning("Attempted checkout with empty cart.");
            return ResponseEntity.badRequest().build();
        }

        // 2. Build items description & Update Inventory
        StringBuilder itemSummary = new StringBuilder();
        for (com.college.stationery.model.CartItem cart : cartItems) {
            itemSummary.append(cart.getName()).append(" (x").append(cart.getQuantity()).append("), ");

            // 📦 Deduct Stock Logic
            productRepository.findByName(cart.getName()).ifPresent(prod -> {
                logger.info("Deducting " + cart.getQuantity() + " from stock of " + prod.getName());
                int newQty = Math.max(0, prod.getQuantity() - cart.getQuantity());
                prod.setQuantity(newQty);
                productRepository.save(prod);
            });
        }

        // Clean up the summary string (remove trailing comma)
        String finalSummary = itemSummary.toString();
        if (finalSummary.endsWith(", ")) {
            finalSummary = finalSummary.substring(0, finalSummary.length() - 2);
        }

        order.setItems(finalSummary.isEmpty() ? "Stationery Items" : finalSummary);
        order.setStatus("PENDING");
        
        com.college.stationery.model.Order savedOrder = orderRepository.save(order);
        
        // 3. Clear the cart in the same transaction
        cartItemRepository.deleteAll();
        logger.info("Order placed and cart cleared: Order ID " + savedOrder.getId());
        
>>>>>>> 23355cab09eae0e58fd8387d75e339331ffbf49d
        return ResponseEntity.ok(savedOrder);
    }

    // Update Order Status (For Manager)
    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable("id") Long id, @RequestParam(name = "status") String status) {
        return orderRepository.findById(id).map(order -> {
            String oldStatus = order.getStatus();
            String newStatus = status.toUpperCase();
            order.setStatus(newStatus);
            Order updatedOrder = orderRepository.save(order);

            // 📢 TRIGGER NOTIFICATION & EMAIL if order is COMPLETED
            if ("COMPLETED".equals(newStatus) && !"COMPLETED".equals(oldStatus)) {
                userRepository.findById(order.getUserId()).ifPresent(user -> {
                    // 1. Create Dashboard Notification
                    com.college.stationery.model.Notification notif = new com.college.stationery.model.Notification();
                    notif.setUserId(user.getId());
                    notif.setMessage("Your order #ORD-" + order.getId() + " has been completed! You can collect it now.");
                    notificationRepository.save(notif);

                    // 2. Send Real Email
                    try {
                        String subject = "Order Completed - KIT's Stationary";
                        String body = "Hello " + user.getFullName() + ",\n\nYour order #" + order.getId() + " is READY for pickup.\n\nItems: " + order.getItems() + "\nTotal: ₹" + order.getTotalPrice() + "\n\nThank you for shopping with us!";
                        emailService.sendSimpleEmail(user.getEmail(), subject, body);
                    } catch (Exception e) {
                        logger.severe("Email failed for order " + order.getId() + ": " + e.getMessage());
                    }
                });
            }

            return ResponseEntity.ok(updatedOrder);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Get ALL Orders (For Manager tracking)
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
