package com.example.backend.controller;

import com.example.backend.dto.order.CreateOrderRequest;
import com.example.backend.dto.order.OrderDto;
import com.example.backend.dto.order.OrderStatusUpdateRequest;
import com.example.backend.security.CurrentUser;
import com.example.backend.security.UserPrincipal;
import com.example.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true", maxAge = 3600, 
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderDto> createOrder(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateOrderRequest request) {
        
        // Kullanıcı kontrolü
        if (currentUser == null) {
            System.out.println("createOrder - HATA: currentUser null!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        OrderDto orderDto = orderService.createOrder(currentUser.getId(), request);
        return new ResponseEntity<>(orderDto, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderDto> getOrderById(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable Long id) {
        
        // Kullanıcı kontrolü
        if (currentUser == null) {
            System.out.println("getOrderById - HATA: currentUser null!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        OrderDto orderDto = orderService.getOrderById(id);
        return ResponseEntity.ok(orderDto);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<OrderDto>> getUserOrders(
            @PathVariable Long userId,
            @CurrentUser UserPrincipal currentUser) {
        
        System.out.println("getUserOrders çağrıldı - userId: " + userId);
        
        // Kullanıcı kimlik kontrolleri
        if (currentUser == null) {
            System.out.println("HATA: currentUser null!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        System.out.println("Kimlik doğrulandı - currentUser.id: " + currentUser.getId());
        
        // Kullanıcı kendi siparişlerini görüntüleyebilir
        if (!currentUser.getId().equals(userId)) {
            System.out.println("Yetki hatası - istek yapılan userId (" + userId + ") oturum açılan kullanıcı ile eşleşmiyor (" + currentUser.getId() + ")");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        List<OrderDto> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderDto> cancelOrder(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable Long id) {
        
        // Kullanıcı kontrolü
        if (currentUser == null) {
            System.out.println("cancelOrder - HATA: currentUser null!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        OrderDto orderDto = orderService.cancelOrder(id);
        return ResponseEntity.ok(orderDto);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        
        OrderDto orderDto = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(orderDto);
    }
} 