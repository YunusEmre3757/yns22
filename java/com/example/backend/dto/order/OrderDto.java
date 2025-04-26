package com.example.backend.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Long id;
    private String orderNumber;
    private LocalDateTime date;
    private BigDecimal totalPrice;
    private String status;
    private String trackingNumber;
    private String address;
    private List<OrderItemDto> items;
} 