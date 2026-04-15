package com.college.stationery.service;

import com.college.stationery.model.Order;
import com.college.stationery.repository.OrderRepository;
import com.college.stationery.dto.DeliveryStatusDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public Order updateDeliveryStatus(Long orderId, String status) {
        return orderRepository.findById(orderId).map(order -> {
            order.setDeliveryStatus(status.toUpperCase());
            if ("DELIVERED".equals(order.getDeliveryStatus())) {
                order.setStatus("COMPLETED");
            }
            return orderRepository.save(order);
        }).orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
    }

    public Order saveOrder(Order order) {
        return orderRepository.save(order);
    }
}
