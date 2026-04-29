package com.college.stationery.controller;

import com.college.stationery.service.SalesInsightsService;
import com.college.stationery.service.DemandPredictionService;
import com.college.stationery.service.ProfitAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/insights")
@CrossOrigin(origins = "*")
public class SalesInsightsController {

    @Autowired
    private SalesInsightsService insightsService;

    @Autowired
    private DemandPredictionService demandPredictionService;

    @Autowired
    private ProfitAnalysisService profitAnalysisService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardInsights() {
        Map<String, Object> insights = new HashMap<>();
        insights.put("bestSeller", insightsService.getBestSellingProduct());
        insights.put("lowPerforming", insightsService.getLowPerformingProducts());
        insights.put("profitMargin", insightsService.calculateOverallProfitMargin());
        insights.put("recommendations", insightsService.generateOfferRecommendations());
        
        // New Features
        insights.put("demandPrediction", demandPredictionService.predictNextMonthDemand());
        insights.put("profitability", profitAnalysisService.getProfitabilityMetrics());
        insights.put("peakHours", insightsService.getPeakBuyingHours());
        insights.put("lifecycle", insightsService.getProductLifecycle());
        
        return ResponseEntity.ok(insights);
    }
}
