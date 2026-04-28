package com.college.stationery.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthlySalesDTO {
    private String month;
    private Double revenue;
    private Long orderCount;
}
