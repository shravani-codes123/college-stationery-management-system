package com.college.stationery.controller;

import com.college.stationery.model.PrintRequest;
import com.college.stationery.repository.PrintRequestRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/print-requests")
@CrossOrigin(origins = "*")
public class PrintRequestController {
    
    private final PrintRequestRepository repository;

    public PrintRequestController(PrintRequestRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public PrintRequest createRequest(@RequestBody PrintRequest request) {
        return repository.save(request);
    }

    @GetMapping
    public List<PrintRequest> getAllRequests() {
        return repository.findAll();
    }
}
