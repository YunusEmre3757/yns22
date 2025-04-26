package com.example.backend.service;

import com.example.backend.dto.auth.AuthResponse;
import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.dto.user.EmailVerificationRequest;
import com.example.backend.dto.user.UpdateProfileRequest;
import com.example.backend.dto.user.UserResponse;
import com.example.backend.exception.UserNotFoundException;
import com.example.backend.dto.address.AddressResponse;
import com.example.backend.model.User;
import com.example.backend.model.DeletedUser;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.DeletedUserRepository;
import com.example.backend.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final DeletedUserRepository deletedUserRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService, DeletedUserRepository deletedUserRepository, RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.deletedUserRepository = deletedUserRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public User registerUser(RegisterRequest registerRequest) {
        // Normal kullanıcı tablosunda email kontrolü
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        // Silinmiş kullanıcılarda email kontrolü (opsiyonel)
        if (deletedUserRepository.existsByOriginalEmail(registerRequest.getEmail())) {
            // Burada sadece log tutabilir veya istatistik için kullanabilirsiniz
            // Genellikle kullanımını engellemek istemeyiz
            System.out.println("Bu e-posta adresi daha önce silinen bir hesapta kullanılmış: " + registerRequest.getEmail());
        }

        // Create new user entity
        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setName(registerRequest.getName());
        user.setSurname(registerRequest.getSurname());
        user.setGender(registerRequest.getGender());
        user.setBirthDate(registerRequest.getBirthDate());
        user.setActive(true); // Default to active
        user.setRoles(Collections.singleton("USER")); // Default role

        return userRepository.save(user);
    }

    public AuthResponse buildUserResponse(User user) {
        return AuthResponse.builder()
                .accessToken(null) // To be set by calling service
                .refreshToken(null) // To be set by calling service
                .tokenType("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }

    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    public UserResponse getUserByEmail(String email) {
        User user = findUserByEmail(email);
        return mapUserToUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findUserByEmail(email);
        
        // Update basic info
        user.setName(request.getName());
        user.setSurname(request.getSurname());
        
        // Format telefon numarası
        if (request.getPhoneNumber() != null) {
            String formattedPhoneNumber = formatPhoneNumber(request.getPhoneNumber());
            user.setPhoneNumber(formattedPhoneNumber);
        } else {
            user.setPhoneNumber(null);
        }
        
        // Only update email if it's changed and verified
        if (!email.equals(request.getEmail())) {
            // Email change requires verification, handled separately
        }
        
        // Update other fields if provided
        if (request.getBirthDate() != null) {
            user.setBirthDate(java.time.LocalDate.ofEpochDay(request.getBirthDate().getTime() / (24 * 60 * 60 * 1000)));
        }
        
        if (request.getGender() != null) {
            user.setGender(request.getGender().toString());
        }
        
        // Save changes
        User updatedUser = userRepository.save(user);
        return mapUserToUserResponse(updatedUser);
    }

    /**
     * Telefon numarasını temizler ve standart formata getirir
     * @param phoneNumber Orjinal telefon numarası
     * @return Formatlanmış telefon numarası
     */
    private String formatPhoneNumber(String phoneNumber) {
        if (phoneNumber == null) {
            return null;
        }
        
        // Sadece rakamları al
        String digitsOnly = phoneNumber.replaceAll("\\D", "");
        
        // 10 veya 11 rakam olmalı (başında 0 olabilir veya olmayabilir)
        if (digitsOnly.length() == 10 && !digitsOnly.startsWith("0")) {
            digitsOnly = "0" + digitsOnly;
        } else if (digitsOnly.length() != 11) {
            // Geçerli format değilse orijinal numarayı döndür
            return phoneNumber;
        }
        
        // 11 rakam varsa "05XXXXXXXXX" formatında olmalı
        if (!digitsOnly.startsWith("05")) {
            return phoneNumber; // Geçerli format değilse orijinal numarayı döndür
        }
        
        return digitsOnly;
    }

    public void sendVerificationEmail(EmailVerificationRequest request) {
        User user = findUserByEmail(request.getCurrentEmail());
        
        // Yeni e-posta adresi belirtilmişse ve bu bir "new" type doğrulama ise
        if ("new".equalsIgnoreCase(request.getType()) && request.getNewEmail() != null) {
            // Yeni e-posta adresi zaten sistemde var mı kontrol et
            if (userRepository.existsByEmail(request.getNewEmail())) {
                throw new RuntimeException("Bu e-posta adresi zaten başka bir hesapta kullanılmaktadır.");
            }
            user.setNewEmail(request.getNewEmail());
        }
        
        // Generate a verification code (6 digits)
        String verificationCode = generateVerificationCode();
        
        // Store the verification code
        user.setEmailVerificationToken(verificationCode);
        user.setEmailVerificationTokenExpiry(LocalDateTime.now().plusMinutes(30)); // Valid for 30 minutes
        
        userRepository.save(user);
        
        // Send verification email
        String emailTo = "current".equalsIgnoreCase(request.getType()) 
            ? request.getCurrentEmail() 
            : request.getNewEmail();
            
        // Gerçek e-posta gönderimi için emailService.sendVerificationEmail kullanın
        // Test/geliştirme ortamı için mock metodu kullanılabilir
        try {
            // Canlı ortamda bu satırı aktif edin
            emailService.sendVerificationEmail(emailTo, verificationCode);
            
            // Şimdilik mock metodunu kullanıyoruz (gerçek e-posta göndermez)
            // emailService.sendVerificationEmailMock(emailTo, verificationCode);
        } catch (Exception e) {
            // E-posta gönderim hatası olursa
            throw new RuntimeException("E-posta gönderilirken bir hata oluştu: " + e.getMessage());
        }
    }

    @Transactional
    public UserResponse confirmEmailChange(String newEmail, String verificationCode) {
        // Find user by verification code and new email
        User user = userRepository.findByEmailVerificationTokenAndNewEmail(verificationCode, newEmail)
            .orElseThrow(() -> new RuntimeException("Invalid or expired verification code"));
        
        // Verify that the code is not expired
        if (user.getEmailVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification code expired");
        }
        
        // Update email
        user.setEmail(newEmail);
        user.setNewEmail(null);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiry(null);
        user.setEmailVerified(true);
        
        User updatedUser = userRepository.save(user);
        
        return mapUserToUserResponse(updatedUser);
    }

    @Transactional
    public void logoutFromAllDevices(String email) {
        User user = findUserByEmail(email);
        
        // Increment token version to invalidate all existing tokens
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        
        // Save user information to deletedUser table
        DeletedUser deletedUser = new DeletedUser();
        deletedUser.setOriginalUserId(user.getId());
        deletedUser.setOriginalEmail(user.getEmail());
        deletedUser.setDeletedAt(LocalDateTime.now());
        deletedUser.setDeletedBy("USER"); // User initiated deletion
        
        deletedUserRepository.save(deletedUser);
        
        // Delete all refresh tokens associated with the user first
        refreshTokenRepository.deleteByUserId(userId);
        
        // Then delete the user
        userRepository.delete(user);
    }
    
    @Transactional
    public void deleteAccount(String email) {
        User user = findUserByEmail(email);
        deleteAccount(user.getId());
    }
    
    // Helper methods
    private UserResponse mapUserToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .surname(user.getSurname())
                .phoneNumber(user.getPhoneNumber())
                .gender(user.getGender() != null && !user.getGender().isEmpty() 
                    ? com.example.backend.model.Gender.valueOf(user.getGender()) 
                    : null)
                .roles(user.getRoles().stream().collect(Collectors.toList()))
                .emailVerified(user.isEmailVerified())
                .createdAt(LocalDateTime.now()) // Use actual value from user entity if available
                .updatedAt(LocalDateTime.now()) // Use actual value from user entity if available
                .build();
    }
    
    private String generateVerificationCode() {
        // Generate a random 6-digit code
        return String.format("%06d", (int) (Math.random() * 1000000));
    }
} 