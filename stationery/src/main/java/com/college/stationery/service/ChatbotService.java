package com.college.stationery.service;

import com.college.stationery.dto.ChatRequest;
import com.college.stationery.dto.ChatResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
@Service
public class ChatbotService {

    @Autowired
    private SynonymMapper synonymMapper;

    @Autowired
    private IntentAnalyzerService intentAnalyzerService;

    @Autowired
    private ContextResponseBuilder contextResponseBuilder;

    public ChatResponse processMessage(ChatRequest request) {
        String originalMsg = request.getMessage() != null ? request.getMessage() : "";
        String role = request.getRole() != null ? request.getRole().toUpperCase() : "STUDENT";
        
        // Phase 1: Natural Language Processing - Synonym substitution
        String normalizedMsg = synonymMapper.normalizeSentence(originalMsg);
        
        // Phase 2: Intent detection using flexible keyword groups + regex
        String intent = intentAnalyzerService.detectIntent(normalizedMsg, role);
        
        // Phase 3 & 4: Database-driven/Contextual Response Building + Role-Awareness
        String reply = contextResponseBuilder.buildResponse(intent, role);
        
        // Fallback for UNKNOWN: Try searching the product catalog
        if ("UNKNOWN".equals(intent) && !originalMsg.isEmpty()) {
            reply = contextResponseBuilder.getRecommendationEngine().searchProduct(originalMsg);
        }
        
        return new ChatResponse(reply);
    }
}
