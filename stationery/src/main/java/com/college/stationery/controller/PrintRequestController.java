package com.college.stationery.controller;

import com.college.stationery.model.PrintRequest;
import com.college.stationery.repository.PrintRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/print-requests")
@CrossOrigin(origins = "*")
public class PrintRequestController {
    
    private final PrintRequestRepository repository;

    public PrintRequestController(PrintRequestRepository repository) {
        this.repository = repository;
    }

    @Autowired
    private com.college.stationery.service.FileStorageService fileStorageService;

    @Autowired
    private com.college.stationery.repository.UserRepository userRepository;

    @Autowired
    private com.college.stationery.repository.NotificationRepository notificationRepository;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createRequest(
            @RequestPart("request") PrintRequest request,
            @RequestPart("file") MultipartFile file) {
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            String filePath = fileStorageService.saveFile(file);
            request.setFileUrl(filePath);
            request.setStatus("PENDING");
            request.setCreatedAt(java.time.LocalDateTime.now());
            
            PrintRequest saved = repository.save(request);
            System.out.println("Print Request saved successfully: ID " + saved.getId());

            // 🔔 Notify Manager about new print request
            userRepository.findByRole("MANAGER").forEach(manager -> {
                com.college.stationery.model.Notification adminNotif = new com.college.stationery.model.Notification();
                adminNotif.setUserId(manager.getId());
                adminNotif.setMessage("New Print Request Received! ID: #PRNT-" + saved.getId());
                notificationRepository.save(adminNotif);
            });

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error saving print request: " + e.getMessage());
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        return serveFile(id, false);
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> viewFile(@PathVariable Long id) {
        return serveFile(id, true);
    }

    private ResponseEntity<Resource> serveFile(Long id, boolean inline) {
        PrintRequest request = repository.findById(id).orElseThrow();
        try {
            Path filePath = Paths.get(request.getFileUrl());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = "application/octet-stream";
                if (request.getDocName() != null) {
                    if (request.getDocName().toLowerCase().endsWith(".pdf")) {
                        contentType = "application/pdf";
                    } else if (request.getDocName().toLowerCase().endsWith(".jpg") || request.getDocName().toLowerCase().endsWith(".jpeg")) {
                        contentType = "image/jpeg";
                    } else if (request.getDocName().toLowerCase().endsWith(".png")) {
                        contentType = "image/png";
                    }
                }

                String disposition = inline ? "inline" : "attachment";
                String filename = request.getDocName();
                if ("application/pdf".equals(contentType) && !filename.toLowerCase().endsWith(".pdf")) {
                    filename += ".pdf";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                System.err.println("File not found or not readable: " + request.getFileUrl());
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public List<PrintRequest> getAllRequests() {
        return repository.findAll();
    }



    // Update Print Request Status (For Manager)
    @PutMapping("/{id}")
    public PrintRequest updateRequestStatus(@PathVariable Long id, @RequestParam String status) {
        PrintRequest request = repository.findById(id).orElseThrow();
        String oldStatus = request.getStatus();
        request.setStatus(status.toUpperCase());
        PrintRequest saved = repository.save(request);

        if ("COMPLETED".equals(saved.getStatus()) && !"COMPLETED".equals(oldStatus)) {
            com.college.stationery.model.Notification notif = new com.college.stationery.model.Notification();
            notif.setUserId(request.getUserId());
            notif.setMessage("Your Print Request #" + request.getId() + " is READY for pickup.");
            notificationRepository.save(notif);
        }
        return saved;
    }

    @GetMapping("/queue-status/{userId}")
    public ResponseEntity<Map<String, Object>> getQueueStatus(@PathVariable Long userId) {
        Optional<PrintRequest> lastRequest = repository.findTopByUserIdOrderByCreatedAtDesc(userId);
        
        Map<String, Object> response = new HashMap<>();
        if (lastRequest.isEmpty() || !"PENDING".equals(lastRequest.get().getStatus())) {
            response.put("active", false);
            return ResponseEntity.ok(response);
        }

        PrintRequest request = lastRequest.get();
        // Position is requests before + 1
        long position = repository.countByStatusAndCreatedAtBefore("PENDING", request.getCreatedAt()) + 1;
        
        response.put("active", true);
        response.put("requestId", request.getId());
        response.put("position", position);
        // Assuming 2 mins per request average
        response.put("estimatedTimeMinutes", position * 2);
        response.put("status", request.getStatus());
        
        return ResponseEntity.ok(response);
    }
}
