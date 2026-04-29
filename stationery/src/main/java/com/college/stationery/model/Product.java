package com.college.stationery.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "products")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String category;
    private Double price;
    private Integer quantity;
    private Integer discount;
    private String imageUrl;
    private Integer salesCount = 0;
    
    @Column(name = "cost_price")
    private Double costPrice;

    @Column(name = "seasonal_tag")
    private String seasonalTag;

    @Column(name = "monthly_sales")
    private Double monthlySales = 0.0;

    @Column(name = "bundle_tag")
    private String bundleTag; // e.g., "ENGINEERING", "EXAM_PACK"

    @Column(name = "student_discount_eligible")
    private Boolean studentDiscountEligible = true;
}
