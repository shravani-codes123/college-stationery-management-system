package com.college.stationery.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ContextResponseBuilder {

    @Autowired
    private RecommendationEngine recommendationEngine;

    public RecommendationEngine getRecommendationEngine() {
        return recommendationEngine;
    }

    public String buildResponse(String intent, String role) {
        if ("GREETING".equals(intent)) {
            return role.equals("MANAGER") ? "I'm doing great, Manager! Ready to help you analyze sales or manage stock. What's on the agenda?" 
                                          : "I'm doing well, thanks for asking! Ready to help you find the best stationery on campus. Looking for something specific?";
        }
        
        if ("GENERAL_HELP".equals(intent)) {
            return role.equals("MANAGER") ? "You can ask me about top-selling items, stock alerts, or profit advice." 
                                          : recommendationEngine.getGeneralStudentHelp();
        }

        if (role.equals("MANAGER")) {
            switch (intent) {
                case "SALES_INSIGHTS": return recommendationEngine.getSalesInsights();
                case "STOCK_ALERT": return recommendationEngine.getStockAlerts();
                case "BUSINESS_ADVICE": return recommendationEngine.getBusinessAdvice();
                case "SLOW_PRODUCTS": return recommendationEngine.getSlowProducts();
            }
        } else {
            switch (intent) {
                case "BUDGET_RECOMMENDATION": return recommendationEngine.getBudgetRecommendation();
                case "CHEAPEST_PRODUCTS": return recommendationEngine.getCheapestProducts();
                case "KIT_RECOMMENDATION": return recommendationEngine.getExamKitRecommendation();
                case "OFFERS": return recommendationEngine.getOffers();
                case "TRENDING_PRODUCTS": return recommendationEngine.getTrendingProducts();
                case "TRACK_ORDER": return "You can track your orders in the 'My Orders' section on your dashboard. Just click on 'View Orders' in the sidebar!";
            }
        }

        return "Can you clarify whether you’re looking for products, discounts, or sales insights?";
    }
}
