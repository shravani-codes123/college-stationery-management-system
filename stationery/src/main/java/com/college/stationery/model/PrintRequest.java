package com.college.stationery.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "print_requests")
public class PrintRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String docName;
    private Integer pages;
    private String type;
    private Integer copies;
    private String status = "PENDING";
}
