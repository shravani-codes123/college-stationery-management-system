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
    private Integer salesCount = 0; // Track units sold for insights
    private String imageUrl;
    private Integer salesCount = 0;
}
