package com.college.stationery.service;

import com.college.stationery.model.Product;
import com.college.stationery.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SalesInsightsService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private com.college.stationery.repository.OrderRepository orderRepository;

    public Map<String, Integer> getPeakBuyingHours() {
        List<com.college.stationery.model.Order> orders = orderRepository.findAll();
        Map<String, Integer> peakHours = new HashMap<>();
        
        // Initialize hours
        for(int i=9; i<=21; i++) {
            peakHours.put(i + ":00", 0);
        }

        for (com.college.stationery.model.Order order : orders) {
            if (order.getOrderDate() != null) {
                int hour = order.getOrderDate().getHour();
                String hourKey = hour + ":00";
                if (peakHours.containsKey(hourKey)) {
                    peakHours.put(hourKey, peakHours.get(hourKey) + 1);
                }
            }
        }
        return peakHours;
    }

    public List<Map<String, Object>> getProductLifecycle() {
        List<Product> products = productRepository.findAll();
        List<Map<String, Object>> lifecycle = new ArrayList<>();

        for (Product p : products) {
            Map<String, Object> status = new HashMap<>();
            status.put("name", p.getName());
            
            int sales = p.getSalesCount() != null ? p.getSalesCount() : 0;
            if (sales > 50) status.put("stage", "Maturity (Cash Cow)");
            else if (sales > 20) status.put("stage", "Growth");
            else if (sales > 5) status.put("stage", "Introduction");
            else status.put("stage", "Stagnant/New");
            
            lifecycle.add(status);
        }
        return lifecycle;
    }

    public Product getBestSellingProduct() {
        List<Product> topProducts = productRepository.findTop5ByOrderBySalesCountDesc();
        return topProducts.isEmpty() ? null : topProducts.get(0);
    }

    public List<Product> getLowPerformingProducts() {
        // Find products with stock > 10 but lowest sales
        return productRepository.findTop5ByQuantityGreaterThanOrderBySalesCountAsc(10);
    }

    public double calculateOverallProfitMargin() {
        List<Product> products = productRepository.findAll();
        double totalRevenue = 0;
        double totalCost = 0;

        for (Product p : products) {
            int sales = (p.getSalesCount() != null) ? p.getSalesCount() : 0;
            double price = (p.getPrice() != null) ? p.getPrice() : 0.0;
            double cost = (p.getCostPrice() != null) ? p.getCostPrice() : (price * 0.7); // default 70% if null

            totalRevenue += price * sales;
            totalCost += cost * sales;
        }

        if (totalRevenue == 0) return 0.0;
        return Math.round(((totalRevenue - totalCost) / totalRevenue) * 100.0 * 10.0) / 10.0;
    }

    public List<Map<String, String>> generateOfferRecommendations() {
        List<Map<String, String>> recommendations = new ArrayList<>();
        List<Product> lowPerforming = getLowPerformingProducts();

        for (Product p : lowPerforming) {
            Map<String, String> rec = new HashMap<>();
            rec.put("productName", p.getName());
            rec.put("suggestion", "Bundle with top sellers or offer a 15% discount.");
            recommendations.add(rec);
        }
        
        if (recommendations.isEmpty()) {
            Map<String, String> rec = new HashMap<>();
            rec.put("productName", "General");
            rec.put("suggestion", "Sales look healthy! Consider a store-wide holiday sale.");
            recommendations.add(rec);
        }

        return recommendations;
    }
}
