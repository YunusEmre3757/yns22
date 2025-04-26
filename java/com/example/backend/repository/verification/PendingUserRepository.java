package com.example.backend.repository.verification;

import com.example.backend.model.verification.PendingUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PendingUserRepository extends JpaRepository<PendingUser, Long> {
    Optional<PendingUser> findByEmail(String email);
    Optional<PendingUser> findByVerificationToken(String verificationToken);
    List<PendingUser> findByExpiresAtBefore(LocalDateTime dateTime);
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
} 