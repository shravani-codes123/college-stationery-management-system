package com.college.stationery.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class SynonymMapper {

    private final Map<String, String> synonymDict = new HashMap<>();

    public SynonymMapper() {
        // Pricing & Quality
        mapSynonyms("budget", "cheap", "affordable", "low-cost", "low cost", "inexpensive", "discounted");
        mapSynonyms("premium", "expensive", "high quality", "best", "top", "luxurious");
        
        // Products
        mapSynonyms("notebook", "copy", "book", "register", "journal", "diary");
        mapSynonyms("pen", "ballpoint", "gel pen", "marker", "highlighter");
        mapSynonyms("kit", "set", "combo", "geometry box", "study kit");

        // Sales & Manager specific
        mapSynonyms("sales", "revenue", "income", "selling", "profit", "sold", "dropping", "performance", "underperforming");
        mapSynonyms("stock", "inventory", "supplies", "items", "availability", "fast");
        mapSynonyms("trending", "popular", "top-selling", "best-seller", "hot");
    }

    private void mapSynonyms(String standard, String... synonyms) {
        synonymDict.put(standard, standard);
        for (String syn : synonyms) {
            synonymDict.put(syn, standard);
        }
    }

    public String normalizeSentence(String sentence) {
        String normalized = sentence.toLowerCase();
        for (Map.Entry<String, String> entry : synonymDict.entrySet()) {
            normalized = normalized.replaceAll("\\b" + entry.getKey() + "\\b", entry.getValue());
        }
        return normalized;
    }
}
