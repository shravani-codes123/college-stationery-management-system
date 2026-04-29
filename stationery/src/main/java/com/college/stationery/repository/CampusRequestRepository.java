package com.college.stationery.repository;

import com.college.stationery.model.CampusRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CampusRequestRepository extends JpaRepository<CampusRequest, Long> {
    List<CampusRequest> findAllByOrderByRequestDateDesc();
}
