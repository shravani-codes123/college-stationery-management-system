package com.college.stationery.controller;

import com.college.stationery.model.Feedback;
import com.college.stationery.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {

    @Autowired
    private FeedbackRepository repository;

    @PostMapping
    public Feedback addFeedback(@RequestBody Feedback feedback) {
        return repository.save(feedback);
    }

    @GetMapping("/{productId}")
    public List<Feedback> getFeedbackByProduct(@PathVariable Long productId) {
        return repository.findByProductId(productId);
    }

    @GetMapping("/{productId}/average")
    public Map<String, Object> getAverageRating(@PathVariable Long productId) {
        List<Feedback> feedbacks = repository.findByProductId(productId);
        double average = feedbacks.stream()
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);
        
        Map<String, Object> result = new HashMap<>();
        result.put("average", Math.round(average * 10.0) / 10.0);
        result.put("count", feedbacks.size());
        return result;
    }
}
