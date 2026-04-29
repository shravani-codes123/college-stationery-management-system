package com.college.stationery.controller;

import com.college.stationery.service.ComboRecommendationService;
import com.college.stationery.service.DynamicPricingService;
import com.college.stationery.service.GamificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/offers")
@CrossOrigin(origins = "*")
public class OfferController {

    @Autowired
    private DynamicPricingService dynamicPricingService;

    @Autowired
    private ComboRecommendationService comboService;

    @Autowired
    private GamificationService gamificationService;

    @GetMapping("/combos")
    public ResponseEntity<?> getCombos() {
        return ResponseEntity.ok(comboService.getCombos());
    }

    @GetMapping("/strategies")
    public ResponseEntity<?> getStrategies() {
        return ResponseEntity.ok(comboService.getPromotionStrategies());
    }

    @PostMapping("/apply-dynamic-pricing")
    public ResponseEntity<?> applyPricing() {
        dynamicPricingService.applyDynamicPricing();
        return ResponseEntity.ok("Dynamic pricing applied successfully.");
    }

    @GetMapping("/user-rewards/{userId}")
    public ResponseEntity<?> getUserRewards(@PathVariable Long userId) {
        Map<String, Object> rewards = new HashMap<>();
        rewards.put("extraDiscount", gamificationService.getDiscountForUser(userId));
        return ResponseEntity.ok(rewards);
    }
}
