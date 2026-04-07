package com.college.stationery.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import com.college.stationery.repository.UserRepository;
import com.college.stationery.model.User;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String requestedRole = request.get("role"); // 👈 Get role from request

        // 🔍 Real Database Search
        Optional<User> userOptional = userRepository.findByEmail(email);

        // 1. Check if user exists
        if (!userOptional.isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "User not found. Please create an account.");
            return ResponseEntity.status(404).body(error);
        }

        User user = userOptional.get();

        // 2. Check if password matches
        if (!user.getPassword().equals(password)) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid password.");
            return ResponseEntity.status(401).body(error);
        }

        // 3. New Change: Check if role matches selected role
        if (requestedRole != null && !user.getRole().equalsIgnoreCase(requestedRole)) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Role mismatch! You are registered as a " + user.getRole() + ".");
            return ResponseEntity.status(403).body(error);
        }

        // 4. Success
        Map<String, String> response = new HashMap<>();
        response.put("token", "jwt-token-" + UUID.randomUUID());
        response.put("role", user.getRole());
        response.put("fullName", user.getFullName());
        response.put("userId", String.valueOf(user.getId())); // 👈 Added for dashboard notifications
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User newUser) {
        // Check if user already exists
        if (userRepository.findByEmail(newUser.getEmail()).isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email is already registered!");
            return ResponseEntity.status(400).body(error);
        }

        // Save new user (In a real app, encrypt the password here!)
        userRepository.save(newUser);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Account created successfully!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String token = UUID.randomUUID().toString();

        try {
            sendEmail(email, token);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Reset link sent to: " + email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        // Log the change (In a real app, update DB here)
        System.out.println("Updating password for token [" + token + "] to [" + newPassword + "]");

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password updated successfully!");
        return ResponseEntity.ok(response);
    }

    private void sendEmail(String toEmail, String token) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        
        helper.setTo(toEmail);
        helper.setSubject("Password Reset Request - KIT's Stationary");
        
        String resetUrl = "http://127.0.0.1:5500/Frontend/reset_password.html?token=" + token;
        
        String content = "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;'>"
                + "<h2 style='color: #2563eb;'>Password Reset Request</h2>"
                + "<p>Hi,</p>"
                + "<p>You requested to reset your password for KIT's Stationary System. Click the button below to proceed:</p>"
                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<a href='" + resetUrl + "' style='background:#2563eb; color:white; padding:12px 25px; text-decoration:none; border-radius:5px; font-weight: bold;'>Reset My Password</a>"
                + "</div>"
                + "<p>Or copy and paste this link in your browser:</p>"
                + "<p style='color: #64748b; font-size: 0.9rem;'>" + resetUrl + "</p>"
                + "<hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>"
                + "<p style='font-size: 0.8rem; color: #94a3b8;'>If you did not request this, please ignore this email.</p>"
                + "</div>";
        
        helper.setText(content, true);
        mailSender.send(message);
    }
}
