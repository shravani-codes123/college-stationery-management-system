package com.college.stationery.controller;

import com.college.stationery.model.Notification;
import com.college.stationery.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/unread")
    public List<Notification> getUnread(@RequestParam Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId);
    }

    @GetMapping
    public List<Notification> getAll(@RequestParam Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @PutMapping("/mark-read")
    public ResponseEntity<Void> markRead(@RequestParam Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        return ResponseEntity.ok().build();
    }
}
