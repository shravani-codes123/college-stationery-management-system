package com.college.stationery.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "combos")
@Data
public class Combo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String items; // Comma separated list of product names or IDs
    private Double price;
    private String tag; // e.g., "ENGINEERING", "EXAM", "SEMESTER"
    private String season; // e.g., "EXAM_SEASON", "REGULAR"
    private Boolean active = true;
}
