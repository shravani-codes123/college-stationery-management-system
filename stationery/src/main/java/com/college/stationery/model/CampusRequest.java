package com.college.stationery.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "campus_requests")
@Data
public class CampusRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String type; // "HOSTEL_DELIVERY" or "BULK_QUOTE"
    private String details;
    private String status = "PENDING"; // PENDING, APPROVED, COMPLETED
    private LocalDateTime requestDate = LocalDateTime.now();
}
