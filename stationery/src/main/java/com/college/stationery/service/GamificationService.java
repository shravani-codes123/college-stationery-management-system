package com.college.stationery.service;

import com.college.stationery.model.User;
import com.college.stationery.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GamificationService {

    @Autowired
    private UserRepository userRepository;

    public void addPoints(Long userId, int amount) {
        userRepository.findById(userId).ifPresent(user -> {
            int newPoints = (user.getRewardPoints() != null ? user.getRewardPoints() : 0) + amount;
            user.setRewardPoints(newPoints);
            
            // Update Tier
            if (newPoints > 1000) user.setLoyaltyTier("GOLD");
            else if (newPoints > 500) user.setLoyaltyTier("SILVER");
            
            userRepository.save(user);
        });
    }

    public double getDiscountForUser(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return 0.0;

        String tier = user.getLoyaltyTier() != null ? user.getLoyaltyTier() : "BRONZE";
        switch (tier) {
            case "GOLD": return 15.0; // 15% extra
            case "SILVER": return 10.0; // 10% extra
            default: return 5.0; // 5% extra
        }
    }
}
