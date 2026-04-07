package com.college.stationery.config;

import com.college.stationery.model.Product;
import com.college.stationery.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(ProductRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                System.out.println("No products found in DB. Initializing default stationery products...");
                
                Product p1 = new Product();
                p1.setName("Premium Spiral Notebook (A4)");
                p1.setCategory("Notebooks");
                p1.setPrice(150.0);
                p1.setQuantity(45);
                p1.setDiscount(10);
                p1.setImageUrl("notebook.jpeg");

                Product p2 = new Product();
                p2.setName("Set of 5 Gel Pens");
                p2.setCategory("Writing");
                p2.setPrice(50.0);
                p2.setQuantity(120);
                p2.setDiscount(0);
                p2.setImageUrl("pens.jpeg");

                Product p3 = new Product();
                p3.setName("Mathematics Geometry Box");
                p3.setCategory("Instruments");
                p3.setPrice(120.0);
                p3.setQuantity(15);
                p3.setDiscount(5);
                p3.setImageUrl("geometrybox.jpeg");

                Product p4 = new Product();
                p4.setName("Colorful Sticky Notes");
                p4.setCategory("Office");
                p4.setPrice(40.0);
                p4.setQuantity(60);
                p4.setDiscount(5);
                p4.setImageUrl("stickynotes.jpeg");

                repository.saveAll(Arrays.asList(p1, p2, p3, p4));
                System.out.println("Default products initialized successfully.");
            } else {
                System.out.println("Products already exist in DB. Skipping initialization.");
            }
        };
    }
}
