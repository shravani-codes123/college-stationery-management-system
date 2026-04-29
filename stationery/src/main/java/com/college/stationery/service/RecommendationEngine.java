package com.college.stationery.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecommendationEngine {
    
    @Autowired
    private com.college.stationery.repository.ProductRepository productRepository;

    @Autowired
    private com.college.stationery.repository.ComboRepository comboRepository;

    public String getBudgetRecommendation() {
        return productRepository.findAll().stream()
                .filter(p -> p.getPrice() < 100)
                .limit(3)
                .map(p -> p.getName() + " (₹" + p.getPrice() + ")")
                .reduce((a, b) -> a + ", " + b)
                .map(s -> "Here are some budget-friendly items for you: " + s)
                .orElse("I couldn't find any items under ₹100 right now.");
    }

    public String getExamKitRecommendation() {
        return comboRepository.findByActiveTrue().stream()
                .filter(c -> (c.getTag() != null && c.getTag().contains("EXAM")) || 
                             (c.getName() != null && c.getName().toLowerCase().contains("exam")))
                .findFirst()
                .map(c -> "I recommend the '" + c.getName() + "' for ₹" + c.getPrice() + ". It includes: " + c.getItems())
                .orElse("A standard Exam Kit usually includes 2 Pens, 1 Ruler, and a Geometry Box. Would you like me to find these individual items?");
    }

    public String getOffers() {
        return "🔥 Current Deals: We have seasonal bundles and up to 20% off on bulk orders. Check the 'Smart Offer Engine' for personalized discounts!";
    }

    public String getTrendingProducts() {
        return productRepository.findTop5ByOrderBySalesCountDesc().stream()
                .limit(3)
                .map(p -> p.getName())
                .reduce((a, b) -> a + ", " + b)
                .map(s -> "Trending now on campus: " + s + ". Everyone is buying these!")
                .orElse("Trending items are being calculated. Check back soon!");
    }

    public String getGeneralStudentHelp() {
        return "I can help you find cheap stationery, suggest exam kits, or track your orders. What's on your mind?";
    }
    
    public String getSalesInsights() {
        long lowStockCount = productRepository.findByQuantityLessThan(10).size();
        return "Sales are steady! You have " + lowStockCount + " items with low stock. Gel Pens are your top performer this week.";
    }

    public String getStockAlerts() {
        return "⚠️ Alert: Some items are below critical levels. Check your Stock Alerts panel to prevent stockouts of popular items.";
    }

    public String getBusinessAdvice() {
        return "💡 Profit Tip: Your 'Slow Moving' items could be bundled with 'Trending' notebooks to clear inventory faster. Try creating a new Combo Pack!";
    }

    public String getCheapestProducts() {
        return productRepository.findAll().stream()
                .sorted((p1, p2) -> p1.getPrice().compareTo(p2.getPrice()))
                .limit(3)
                .map(p -> p.getName() + " (₹" + p.getPrice() + ")")
                .reduce((a, b) -> a + ", " + b)
                .map(s -> "Our most affordable items: " + s)
                .orElse("All products seem to be reasonably priced!");
    }

    public String getSlowProducts() {
        return productRepository.findTop5ByQuantityGreaterThanOrderBySalesCountAsc(5).stream()
                .limit(3)
                .map(p -> p.getName())
                .reduce((a, b) -> a + ", " + b)
                .map(s -> "These items are moving slowly: " + s + ". Consider a dynamic price drop or a combo offer.")
                .orElse("All items are selling well! Great job.");
    }

    public String searchProduct(String query) {
        String normalized = query.toLowerCase().replace("search", "").replace("find", "").replace("for", "").trim();
        return productRepository.findAll().stream()
                .filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(normalized)) || 
                             (p.getCategory() != null && p.getCategory().toLowerCase().contains(normalized)))
                .limit(2)
                .map(p -> p.getName() + " (₹" + p.getPrice() + ") - Stock: " + p.getQuantity())
                .reduce((a, b) -> a + " | " + b)
                .map(s -> "I found these matching items: " + s)
                .orElse("I couldn't find a specific product for '" + query + "', but you can browse our full catalog in the 'View Stationery' section!");
    }
}
