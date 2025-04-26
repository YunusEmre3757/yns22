package com.example.backend.service;

import com.example.backend.dto.order.CreateOrderRequest;
import com.example.backend.dto.order.OrderDto;
import java.util.List;

public interface OrderService {
    OrderDto createOrder(Long userId, CreateOrderRequest request);
    OrderDto getOrderById(Long id);
    List<OrderDto> getUserOrders(Long userId);
    OrderDto cancelOrder(Long orderId);
    OrderDto updateOrderStatus(Long orderId, String status);
} 