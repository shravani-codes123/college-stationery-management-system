package com.college.stationery.repository;

import com.college.stationery.model.PrintRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrintRequestRepository extends JpaRepository<PrintRequest, Long> {
}
