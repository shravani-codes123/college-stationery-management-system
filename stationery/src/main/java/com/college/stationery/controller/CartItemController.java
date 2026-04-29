package com.college.stationery.controller;

import com.college.stationery.model.CartItem;
import com.college.stationery.repository.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*") 
public class CartItemController {

    @Autowired
    private CartItemRepository cartItemRepository;

    private static final Long DEFAULT_USER = 1L; // Simulation UserId

    // GET All Cart Items
    @GetMapping
    public List<CartItem> getCart() {
        return cartItemRepository.findAll();
    }

    // ADD Item to Database Cart
    @PostMapping("/add")
    public ResponseEntity<CartItem> addToCart(@RequestBody CartItem item) {
        item.setUserId(DEFAULT_USER);
        
        // If already in cart, increment quantity
        return cartItemRepository.findByNameAndUserId(item.getName(), DEFAULT_USER)
                .map(existing -> {
                    existing.setQuantity(existing.getQuantity() + 1);
                    return ResponseEntity.ok(cartItemRepository.save(existing));
                }).orElseGet(() -> ResponseEntity.ok(cartItemRepository.save(item)));
    }

    // REMOVE Item
    @DeleteMapping("/{id}")
    public void removeFromCart(@PathVariable("id") Long id) {
        cartItemRepository.deleteById(id);
    }

    // CLEAR Cart (After Checkout)
    @DeleteMapping("/clear")
    @Transactional
    public void clearCart() {
        cartItemRepository.deleteAll();
    }
}
