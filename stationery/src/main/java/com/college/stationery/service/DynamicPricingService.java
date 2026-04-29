package com.college.stationery.service;

import com.college.stationery.model.Product;
import com.college.stationery.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DynamicPricingService {

    @Autowired
    private ProductRepository productRepository;

    public void applyDynamicPricing() {
        List<Product> products = productRepository.findAll();

        for (Product product : products) {
            int stock = product.getQuantity() != null ? product.getQuantity() : 0;
            int sales = product.getSalesCount() != null ? product.getSalesCount() : 0;
            String tag = product.getSeasonalTag() != null ? product.getSeasonalTag() : "Regular";

            // Rule 1: High stock + low sales → Auto discount
            if (stock > 50 && sales < 5) {
                product.setDiscount(20); // 20% discount to clear stock
            } 
            // Rule 2: High demand + low stock → Reduce discount
            else if (sales > 30 && stock < 10) {
                product.setDiscount(0); // No discount for high demand items
            }
            // Rule 3: Seasonal products
            if ("Exam Season".equalsIgnoreCase(tag)) {
                product.setDiscount(15);
            }

            productRepository.save(product);
        }
    }
}
