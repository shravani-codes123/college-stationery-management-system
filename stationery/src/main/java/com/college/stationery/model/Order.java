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

    private Long userId; // We'll link this to the logged-in student later
    private Double totalPrice;
    private String status = "PENDING";
    private LocalDateTime orderDate = LocalDateTime.now();
    
    // For simplicity, we can store order details as a string or items later
    @Column(length = 2000)
    private String items; 
}
