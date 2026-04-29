package com.college.stationery.controller;

import com.college.stationery.model.CampusRequest;
import com.college.stationery.repository.CampusRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campus-requests")
@CrossOrigin(origins = "*")
public class CampusRequestController {

    @Autowired
    private CampusRequestRepository repository;

    @Autowired
    private com.college.stationery.service.NotificationService notificationService;

    @GetMapping
    public List<CampusRequest> getAllRequests() {
        return repository.findAllByOrderByRequestDateDesc();
    }

    @PostMapping
    public ResponseEntity<CampusRequest> createRequest(@RequestBody CampusRequest request) {
        CampusRequest saved = repository.save(request);
        
        // Notify Manager (assuming userId 1 is manager)
        String msg = "New Campus Request: " + request.getType() + " - " + request.getDetails();
        notificationService.sendNotification(1L, msg);
        
        return ResponseEntity.status(201).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CampusRequest> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return repository.findById(id).map(request -> {
            request.setStatus(status);
            return ResponseEntity.ok(repository.save(request));
        }).orElse(ResponseEntity.notFound().build());
    }
}
