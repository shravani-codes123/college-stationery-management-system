package com.college.stationery.service;

import org.springframework.stereotype.Service;

@Service
public class IntentAnalyzerService {

    public String detectIntent(String message, String role) {
        // General Intents
        if (message.matches(".*\\b(hi|hello|hey|greetings|howdy|hi chatbot|yo)\\b.*")) return "GREETING";
        if (message.matches(".*\\b(how are you|how r u|hru|doing)\\b.*")) return "GREETING";
        if (message.matches(".*\\b(confused|help|suggest|what to buy|don't know|dont know|assist|options|capability|what can you do|how to use|features|who are you)\\b.*")) return "GENERAL_HELP";
        if (message.matches(".*\\b(thanks|thank you|awesome|great|cool|thx)\\b.*")) return "GREETING";

        if (role.equals("MANAGER")) {
            if (message.contains("sales") || message.contains("revenue") || message.contains("trending") || message.contains("performance")) return "SALES_INSIGHTS";
            if (message.contains("stock") || message.contains("inventory") || message.contains("restock") || message.contains("low")) return "STOCK_ALERT";
            if (message.contains("advice") || message.contains("profit") || message.contains("improve") || message.contains("business") || message.contains("money")) return "BUSINESS_ADVICE";
            if (message.contains("slow") || message.contains("not selling") || message.contains("dead stock") || message.contains("bad")) return "SLOW_PRODUCTS";
        } else {
            if (message.contains("cheap") || message.contains("affordable") || message.contains("low price") || message.contains("cost effective") || message.contains("price")) return "CHEAPEST_PRODUCTS";
            if (message.contains("budget") || message.contains("money") || message.contains("saving") || message.contains("limit")) return "BUDGET_RECOMMENDATION";
            if (message.contains("exam") || message.contains("engineering") || message.contains("kit") || message.contains("semester") || message.contains("pack") || message.contains("study")) return "KIT_RECOMMENDATION";
            if (message.contains("combo") || message.contains("discount") || message.contains("offer") || message.contains("deal") || message.contains("sale")) return "OFFERS";
            if (message.contains("trending") || message.contains("popular") || message.contains("best seller") || message.contains("everyone buying")) return "TRENDING_PRODUCTS";
            if (message.contains("order") || message.contains("track") || message.contains("where is my") || message.contains("delivery")) return "TRACK_ORDER";
        }

        return "UNKNOWN";
    }
}
