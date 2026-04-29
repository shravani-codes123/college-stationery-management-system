package com.college.stationery.service;

import com.college.stationery.model.Product;
import com.college.stationery.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ComboRecommendationService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private com.college.stationery.repository.ComboRepository comboRepository;

    public List<Map<String, Object>> getCombos() {
        return comboRepository.findByActiveTrue().stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("name", c.getName());
            map.put("items", Arrays.asList(c.getItems().split(",")));
            map.put("price", c.getPrice());
            map.put("tag", c.getTag());
            return map;
        }).collect(Collectors.toList());
    }

    private Map<String, Object> createCombo(String name, List<String> items, Double price, String tag) {
        Map<String, Object> combo = new HashMap<>();
        combo.put("name", name);
        combo.put("items", items);
        combo.put("price", price);
        combo.put("tag", tag);
        return combo;
    }
    
    public List<Map<String, String>> getPromotionStrategies() {
        List<Map<String, String>> strategies = new ArrayList<>();
        
        // Mocking strategy generation based on common patterns
        strategies.add(createStrategy("Hostel Flash Sale", "Recommended for tonight: 10% off for Hostel 4 delivery. Matches high evening demand."));
        strategies.add(createStrategy("Department Bundle", "Bundle 'Drafting Pens' with 'Set Squares' for CSE freshmen. Matches course requirements."));
        strategies.add(createStrategy("Exam Prep Discount", "Apply 5% off on all 'Pencils' and 'Erasers' starting tomorrow morning."));
        
        return strategies;
    }

    private Map<String, String> createStrategy(String title, String description) {
        Map<String, String> strategy = new HashMap<>();
        strategy.put("title", title);
        strategy.put("description", description);
        return strategy;
    }
}
