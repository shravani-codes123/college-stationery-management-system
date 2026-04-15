package com.college.stationery.controller;

import com.college.stationery.dto.SalesDataDTO;
import com.college.stationery.model.Product;
import com.college.stationery.repository.OrderRepository;
import com.college.stationery.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/sales/daily")
    public List<SalesDataDTO> getDailySales() {
        return orderRepository.getDailySales().stream()
                .map(obj -> new SalesDataDTO(obj[0].toString(), (Double) obj[1]))
                .collect(Collectors.toList());
    }

    @GetMapping("/sales/monthly")
    public List<SalesDataDTO> getMonthlySales() {
        return orderRepository.getMonthlySales().stream()
                .map(obj -> new SalesDataDTO(obj[0].toString(), (Double) obj[1]))
                .collect(Collectors.toList());
    }

    @GetMapping("/top-products")
    public List<SalesDataDTO> getTopProducts() {
        return productRepository.findTop5ByOrderBySalesCountDesc().stream()
                .map(p -> new SalesDataDTO(p.getName(), (double) (p.getSalesCount() == null ? 0 : p.getSalesCount())))
                .collect(Collectors.toList());
    }
}
