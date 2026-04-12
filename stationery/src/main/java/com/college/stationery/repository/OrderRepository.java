package com.college.stationery.repository;

import com.college.stationery.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Map;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT FUNCTION('DATE', o.orderDate) as date, SUM(o.totalPrice) as total FROM Order o GROUP BY FUNCTION('DATE', o.orderDate)")
    List<Object[]> getDailySales();

    @Query("SELECT FUNCTION('MONTHNAME', o.orderDate) as month, SUM(o.totalPrice) as total FROM Order o GROUP BY FUNCTION('MONTH', o.orderDate), FUNCTION('MONTHNAME', o.orderDate)")
    List<Object[]> getMonthlySales();

    List<Order> findByUserId(Long userId);
}
