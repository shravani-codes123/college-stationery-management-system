package com.college.stationery.service;

import com.college.stationery.model.Product;
import com.college.stationery.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ProfitAnalysisService {

    @Autowired
    private ProductRepository productRepository;

    public Map<String, Object> getProfitabilityMetrics() {
        List<Product> products = productRepository.findAll();
        double totalRevenue = 0;
        double totalProfit = 0;
        List<Map<String, Object>> lowMarginItems = new ArrayList<>();

        for (Product product : products) {
            double price = product.getPrice() != null ? product.getPrice() : 0.0;
            double cost = product.getCostPrice() != null ? product.getCostPrice() : price * 0.7;
            int sales = product.getSalesCount() != null ? product.getSalesCount() : 0;

            double revenue = price * sales;
            double profit = (price - cost) * sales;
            double margin = price > 0 ? ((price - cost) / price) * 100 : 0;

            totalRevenue += revenue;
            totalProfit += profit;

            if (margin < 15 && sales > 0) {
                Map<String, Object> lowMargin = new HashMap<>();
                lowMargin.put("name", product.getName());
                lowMargin.put("margin", Math.round(margin * 10.0) / 10.0);
                lowMarginItems.add(lowMargin);
            }
        }

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        metrics.put("totalProfit", Math.round(totalProfit * 100.0) / 100.0);
        metrics.put("overallMargin", totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100.0 * 10.0) / 10.0 : 0.0);
        metrics.put("lowMarginWarnings", lowMarginItems);

        return metrics;
    }
}
