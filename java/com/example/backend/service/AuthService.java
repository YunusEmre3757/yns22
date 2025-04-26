package com.example.backend.service;

import com.example.backend.dto.auth.AuthResponse;
import com.example.backend.dto.auth.LoginRequest;
import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.dto.auth.ChangePasswordRequest;
import com.example.backend.dto.RefreshTokenRequest;
import com.example.backend.dto.user.UserResponse;
import com.example.backend.exception.TokenRefreshException;
import com.example.backend.model.RefreshToken;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager,
            CustomUserDetailsService userDetailsService,
            RefreshTokenService refreshTokenService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setActive(true); // For simplicity, we're setting it to true. In a real app, you might want email verification
        user.setRoles(Collections.singleton("USER"));
        user.setName(request.getName());
        user.setSurname(request.getSurname());
        user.setGender(request.getGender());
        user.setBirthDate(request.getBirthDate());

        User savedUser = userRepository.save(user);
        logger.info("User registered successfully: {}", savedUser.getEmail());

        // Generate JWT token
        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        String accessToken = jwtService.generateAccessToken(userDetails);
        
        // Create refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .surname(savedUser.getSurname())
                .phoneNumber(savedUser.getPhoneNumber())
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        logger.info("Login attempt for user: {}", request.getEmail());
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            logger.info("User authenticated successfully: {}", user.getEmail());

            // Generate access token
            String accessToken = jwtService.generateAccessToken(userDetails);
            
            // Generate new refresh token
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getEmail());
            
            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken.getToken())
                    .tokenType("Bearer")
                    .userId(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .surname(user.getSurname())
                    .phoneNumber(user.getPhoneNumber())
                    .build();
        } catch (Exception e) {
            logger.error("Authentication failed for user {}: {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest refreshTokenRequest) {
        String requestRefreshToken = refreshTokenRequest.getRefreshToken();
        
        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshToken -> {
                    // Verify token expiration and usage count
                    refreshTokenService.verifyExpiration(refreshToken);
                    
                    User user = refreshToken.getUser();
                    UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
                    
                    // Invalidate the old refresh token
                    refreshTokenService.deleteByToken(requestRefreshToken);
                    
                    // Create a new refresh token (token rotation)
                    RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getEmail());
                    logger.info("Refresh token rotated for user: {}", user.getEmail());
                    
                    // Generate new access token
                    String accessToken = jwtService.generateAccessToken(userDetails);
                    
                    return AuthResponse.builder()
                            .accessToken(accessToken)
                            .refreshToken(newRefreshToken.getToken())
                            .tokenType("Bearer")
                            .userId(user.getId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .surname(user.getSurname())
                            .phoneNumber(user.getPhoneNumber())
                            .build();
                })
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken, "Refresh token is not found in database."));
    }
    
    @Transactional
    public void logout(Long userId) {
        refreshTokenService.deleteByUserId(userId);
        logger.info("User logged out and all refresh tokens deleted for userId: {}", userId);
    }

    @Transactional
    public UserResponse changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        
        // Set new password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user = userRepository.save(user);
        
        logger.info("Password changed successfully for user: {}", email);
        
        // Map to UserResponse
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .surname(user.getSurname())
                .phoneNumber(user.getPhoneNumber())
                .gender(user.getGender() != null && !user.getGender().isEmpty() 
                    ? com.example.backend.model.Gender.valueOf(user.getGender()) 
                    : null)
                .roles(user.getRoles().stream().collect(java.util.stream.Collectors.toList()))
                .emailVerified(user.isEmailVerified())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
} 