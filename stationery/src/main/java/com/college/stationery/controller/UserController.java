package com.college.stationery.controller;

import com.college.stationery.model.User;
import com.college.stationery.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/add-points")
    public ResponseEntity<User> addPoints(@PathVariable Long id, @RequestParam Integer points) {
        return userRepository.findById(id).map(user -> {
            user.setRewardPoints(user.getRewardPoints() + points);
            
            // Tier Upgrade Logic
            if (user.getRewardPoints() > 1000) user.setLoyaltyTier("GOLD");
            else if (user.getRewardPoints() > 500) user.setLoyaltyTier("SILVER");
            
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }
}
