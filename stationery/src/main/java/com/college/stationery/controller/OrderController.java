package com.college.stationery.controller;

import com.college.stationery.model.Order;
import com.college.stationery.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.io.ByteArrayInputStream;
import java.io.IOException;
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
    private com.college.stationery.service.EmailService emailService;

    @Autowired
    private com.college.stationery.repository.NotificationRepository notificationRepository;

    @Autowired
    private com.college.stationery.repository.UserRepository userRepository;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private com.college.stationery.service.OrderService orderService;

    // Place NEW Order (Student Checkout)
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
                prod.setSalesCount((prod.getSalesCount() == null ? 0 : prod.getSalesCount()) + cart.getQuantity());
                productRepository.save(prod);

                // 🔔 Trigger Low Stock Alert
                if (newQty < 5) {
                    com.college.stationery.model.Notification alert = new com.college.stationery.model.Notification();
                    alert.setUserId(1L); // Send to Manager (Assuming ID 1 is manager or broadcast)
                    alert.setMessage("LOW STOCK ALERT: " + prod.getName() + " only " + newQty + " left!");
                    notificationRepository.save(alert);
                }
            });
        }

        // Clean up the summary string (remove trailing comma)
        String finalSummary = itemSummary.toString();
        if (finalSummary.endsWith(", ")) {
            finalSummary = finalSummary.substring(0, finalSummary.length() - 2);
        }

        order.setItems(finalSummary.isEmpty() ? "Stationery Items" : finalSummary);
        order.setStatus("PENDING");
        order.setDeliveryStatus("PENDING");
        order.setPaymentStatus("PAID");
        
        com.college.stationery.model.Order savedOrder = orderService.saveOrder(order);
        
        // 🔔 Notify Manager about new order
        com.college.stationery.model.Notification adminNotif = new com.college.stationery.model.Notification();
        adminNotif.setUserId(1L); // Assuming 1 is Manager
        adminNotif.setMessage("New Order Received! Order ID: #ORD-" + savedOrder.getId());
        notificationRepository.save(adminNotif);

        // 3. Clear the cart in the same transaction
        cartItemRepository.deleteAll();
        logger.info("Order placed and cart cleared: Order ID " + savedOrder.getId());
        
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
        return orderService.getAllOrders();
    }

    // Get Orders by User ID (For Student tracking)
    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUserId(@PathVariable Long userId) {
        return orderService.getOrdersByUserId(userId);
    }

    // Update Delivery Status (For Manager)
    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateDeliveryStatus(@PathVariable Long id, @RequestBody com.college.stationery.dto.DeliveryStatusDTO statusDTO) {
        try {
            Order updatedOrder = orderService.updateDeliveryStatus(id, statusDTO.getDeliveryStatus());
            
            // 📢 Notify Student of delivery update
            userRepository.findById(updatedOrder.getUserId()).ifPresent(user -> {
                com.college.stationery.model.Notification notif = new com.college.stationery.model.Notification();
                notif.setUserId(user.getId());
                notif.setMessage("Your order #ORD-" + updatedOrder.getId() + " status updated to: " + updatedOrder.getDeliveryStatus());
                notificationRepository.save(notif);
            });

            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<InputStreamResource> downloadInvoice(@PathVariable Long id) throws IOException {
        Order order = orderRepository.findById(id).orElseThrow();
        ByteArrayInputStream bis = invoiceService.generateInvoice(order);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=invoice_ORD_" + id + ".pdf");
        headers.add("Access-Control-Expose-Headers", "Content-Disposition");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }
}
