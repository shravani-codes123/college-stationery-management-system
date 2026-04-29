package com.college.stationery.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    private String role; // "STUDENT" or "MANAGER"
    private String resetToken;

    @Column(name = "reward_points")
    private Integer rewardPoints = 0;

    @Column(name = "loyalty_tier")
    private String loyaltyTier = "BRONZE"; // BRONZE, SILVER, GOLD
}
