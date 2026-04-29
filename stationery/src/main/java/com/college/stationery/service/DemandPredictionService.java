package com.college.stationery.service;

import com.college.stationery.model.Product;
import com.college.stationery.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DemandPredictionService {

    @Autowired
    private ProductRepository productRepository;

    public Map<String, Object> predictNextMonthDemand() {
        List<Product> products = productRepository.findAll();
        Map<String, Object> prediction = new HashMap<>();
        
        List<Map<String, Object>> forecastData = new ArrayList<>();
        List<String> restockAlerts = new ArrayList<>();
        List<String> seasonalInsights = new ArrayList<>();

        for (Product product : products) {
            double currentSales = product.getMonthlySales() != null ? product.getMonthlySales() : 0.0;
            String tag = product.getSeasonalTag() != null ? product.getSeasonalTag() : "Regular";
            
            // Simple heuristic for prediction
            double multiplier = 1.0;
            if ("Exam Season".equalsIgnoreCase(tag)) {
                multiplier = 1.5; // Expect 50% increase
                seasonalInsights.add("High demand expected for " + product.getName() + " due to upcoming exams.");
            } else if ("Semester Start".equalsIgnoreCase(tag)) {
                multiplier = 1.3;
            }

            double predictedDemand = currentSales * multiplier;
            
            Map<String, Object> item = new HashMap<>();
            item.put("name", product.getName());
            item.put("current", currentSales);
            item.put("predicted", Math.round(predictedDemand * 100.0) / 100.0);
            forecastData.add(item);

            // Restock timing for pens and fast movers
            if (product.getQuantity() < predictedDemand * 0.5) {
                restockAlerts.add("Restock " + product.getName() + " immediately. Predicted demand exceeds 50% of current stock.");
            }
        }

        prediction.put("forecast", forecastData);
        prediction.put("alerts", restockAlerts);
        prediction.put("insights", seasonalInsights);
        
        return prediction;
    }
}
