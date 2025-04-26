package com.example.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            @Qualifier("customUserDetailsService") UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String email;

        // Debug için
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Auth header: " + authHeader);

        // Skip filter for public endpoints
        String path = request.getRequestURI();
        if (path.startsWith("/api/auth/login") ||
            path.startsWith("/api/auth/register") ||
            path.startsWith("/api/auth/refresh-token") ||
            path.startsWith("/api/categories/") ||
            path.startsWith("/api/products/") ||  // Allow all product endpoints without authentication
            path.startsWith("/api/products/category/slug/") ||  // Explicitly allow category/slug endpoint
            path.startsWith("/api/verification/login") ||
            path.startsWith("/api/verification/register") ||
            path.startsWith("/api/verification/verify-email") ||
            path.startsWith("/api/verification/verify-email-change") ||
            path.startsWith("/api/verification/verify-current-email") ||
            path.startsWith("/api/verification/resend-registration") ||
            path.startsWith("/api/verification/check-status")) {
            System.out.println("Skipping authentication for path: " + path);
            filterChain.doFilter(request, response);
            return;
        }

        // Özel durum: users API'si için token kontrolünü atlarken token'ı parse et ve SecurityContext'e kaydet
        if (path.startsWith("/api/users/") || path.startsWith("/api/orders/")) {
            System.out.println("Special handling for users/orders API: " + path);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwt = authHeader.substring(7);
                System.out.println("JWT token: " + jwt.substring(0, Math.min(10, jwt.length())) + "...");
                email = jwtService.extractEmail(jwt);
                System.out.println("Extracted email from token: " + email);
                
                if (email != null) {
                    try {
                        UserDetails userDetails = this.userDetailsService.loadUserByUsername(email);
                        if (jwtService.isTokenValid(jwt, userDetails)) {
                            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                            authToken.setDetails(
                                    new WebAuthenticationDetailsSource().buildDetails(request)
                            );
                            SecurityContextHolder.getContext().setAuthentication(authToken);
                            System.out.println("Authentication set in SecurityContext for: " + email);
                        } else {
                            System.out.println("Token geçerli değil: " + email);
                        }
                    } catch (Exception e) {
                        System.out.println("Kullanıcı yükleme hatası: " + e.getMessage());
                    }
                }
            } else {
                System.out.println("Orders API için token bulunamadı veya geçersiz format");
            }
            filterChain.doFilter(request, response);
            return;
        }

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("No valid auth header found, skipping authentication");
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        System.out.println("JWT token: " + jwt.substring(0, Math.min(10, jwt.length())) + "...");
        email = jwtService.extractEmail(jwt);
        System.out.println("Extracted email: " + email);

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(email);
            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
} 