package com.college.stationery.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@Table(name = "print_requests")
public class PrintRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String docName;
    private Integer pages;
    private String type;
    private Integer copies;
    private Long userId;
    private String fileUrl;
    private String status = "PENDING";
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    // 🚚 Delivery Fields for Print Requests
    private String fullName;
    private String phoneNumber;
    private String addressLine;
    private String city;
    private String pincode;
}
