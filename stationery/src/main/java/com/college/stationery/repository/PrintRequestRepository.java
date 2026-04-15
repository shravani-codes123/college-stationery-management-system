package com.college.stationery.repository;

import com.college.stationery.model.PrintRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.time.LocalDateTime;

@Repository
public interface PrintRequestRepository extends JpaRepository<PrintRequest, Long> {
    Optional<PrintRequest> findTopByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Count how many requests are PENDING and were submitted BEFORE the given time
    long countByStatusAndCreatedAtBefore(String status, LocalDateTime createdAt);
}
