package com.college.stationery.controller;

import com.college.stationery.model.Combo;
import com.college.stationery.repository.ComboRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/combos")
@CrossOrigin(origins = "*")
public class ComboController {

    @Autowired
    private ComboRepository comboRepository;

    @GetMapping
    public List<Combo> getAllCombos() {
        return comboRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Combo> addCombo(@RequestBody Combo combo) {
        return ResponseEntity.status(201).body(comboRepository.save(combo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Combo> updateCombo(@PathVariable Long id, @RequestBody Combo details) {
        return comboRepository.findById(id).map(combo -> {
            combo.setName(details.getName());
            combo.setItems(details.getItems());
            combo.setPrice(details.getPrice());
            combo.setTag(details.getTag());
            combo.setSeason(details.getSeason());
            combo.setActive(details.getActive());
            return ResponseEntity.ok(comboRepository.save(combo));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCombo(@PathVariable Long id) {
        comboRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
