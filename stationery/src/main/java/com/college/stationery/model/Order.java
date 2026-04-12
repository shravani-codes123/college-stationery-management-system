package com.college.stationery.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Double totalPrice;
    private String status = "PENDING"; // General status (PENDING/COMPLETED)
    private LocalDateTime orderDate = LocalDateTime.now();
    
    @Column(length = 2000)
    private String items;

    // 🚚 New Delivery Fields
    private String fullName;
    private String phoneNumber;
    private String addressLine;
    private String city;
    private String pincode;
    private String deliveryStatus = "PENDING"; // PENDING, PACKED, OUT_FOR_DELIVERY, DELIVERED
    private String paymentStatus = "PAID"; // Default to PAID as per requirements
}
