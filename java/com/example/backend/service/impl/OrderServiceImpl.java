package com.example.backend.service.impl;

import com.example.backend.dto.order.CreateOrderRequest;
import com.example.backend.dto.order.OrderDto;
import com.example.backend.dto.order.OrderItemDto;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Order;
import com.example.backend.model.OrderItem;
import com.example.backend.model.Product;
import com.example.backend.model.User;
import com.example.backend.repository.OrderItemRepository;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public OrderDto createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı"));

        // Stok kontrolü
        for (var itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Ürün bulunamadı: " + itemRequest.getProductId()));
            
            if (product.getStock() < itemRequest.getQuantity()) {
                throw new IllegalStateException(
                    "Yetersiz stok: " + product.getName() + 
                    " için " + itemRequest.getQuantity() + 
                    " adet istendi, stokta " + product.getStock() + " adet var."
                );
            }
        }

        Order order = new Order();
        order.setUser(user);
        order.setDate(LocalDateTime.now());
        order.setTotalPrice(request.getTotalPrice());
        order.setStatus(request.getStatus() != null ? request.getStatus() : "Beklemede");
        order.setAddress(request.getAddress());
        order.setItems(new ArrayList<>());

        // Önce siparişi kaydet
        Order savedOrder = orderRepository.save(order);

        // Sipariş öğelerini oluştur ve kaydet
        List<OrderItem> orderItems = request.getItems().stream()
                .map(itemRequest -> {
                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(savedOrder);
                    orderItem.setProductId(itemRequest.getProductId());
                    orderItem.setProductName(itemRequest.getProductName());
                    orderItem.setPrice(itemRequest.getPrice());
                    orderItem.setQuantity(itemRequest.getQuantity());
                    orderItem.setImage(itemRequest.getImage());
                    
                    // Stok güncelleme
                    Product product = productRepository.findById(itemRequest.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Ürün bulunamadı: " + itemRequest.getProductId()));
                    product.setStock(product.getStock() - itemRequest.getQuantity());
                    productRepository.save(product);
                    
                    return orderItem;
                })
                .collect(Collectors.toList());

        orderItemRepository.saveAll(orderItems);
        savedOrder.setItems(orderItems);

        return mapToOrderDto(savedOrder);
    }

    @Override
    public OrderDto getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sipariş bulunamadı"));
        return mapToOrderDto(order);
    }

    @Override
    public List<OrderDto> getUserOrders(Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByDateDesc(userId);
        return orders.stream()
                .map(this::mapToOrderDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderDto cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sipariş bulunamadı"));
        
        if (!"Beklemede".equals(order.getStatus())) {
            throw new IllegalStateException("Sadece bekleyen siparişler iptal edilebilir");
        }
        
        // İptal edildiğinde stokları geri ekle
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Ürün bulunamadı: " + item.getProductId()));
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }
        
        order.setStatus("İptal Edildi");
        return mapToOrderDto(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderDto updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sipariş bulunamadı"));
        
        order.setStatus(status);
        return mapToOrderDto(orderRepository.save(order));
    }

    private OrderDto mapToOrderDto(Order order) {
        List<OrderItemDto> orderItemDtos = order.getItems().stream()
                .map(item -> OrderItemDto.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .image(item.getImage())
                        .build())
                .collect(Collectors.toList());

        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .date(order.getDate())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .trackingNumber(order.getTrackingNumber())
                .address(order.getAddress())
                .items(orderItemDtos)
                .build();
    }
} 