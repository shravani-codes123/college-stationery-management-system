package com.college.stationery.controller;

import com.college.stationery.dto.ChatRequest;
import com.college.stationery.dto.ChatResponse;
import com.college.stationery.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping
    public ResponseEntity<ChatResponse> handleChat(@RequestBody ChatRequest request) {
        ChatResponse response = chatbotService.processMessage(request);
        return ResponseEntity.ok(response);
    }
}
