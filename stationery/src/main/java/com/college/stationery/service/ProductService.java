package com.college.stationery.service;

import com.college.stationery.model.Product;
import com.college.stationery.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class ProductService {

    private static final Logger logger = Logger.getLogger(ProductService.class.getName());

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product saveProduct(Product product) {
        logger.info("Saving product: " + product.getName());
        return productRepository.save(product);
    }

    public Optional<Product> updateProduct(Long id, Product details) {
        logger.info("Updating product ID: " + id);
        return productRepository.findById(id).map(prod -> {
            prod.setName(details.getName());
            prod.setCategory(details.getCategory());
            prod.setPrice(details.getPrice());
            prod.setQuantity(details.getQuantity());
            prod.setDiscount(details.getDiscount());
            prod.setImageUrl(details.getImageUrl());
            return productRepository.save(prod);
        });
    }

    public void deleteProduct(Long id) {
        logger.info("Deleting product ID: " + id);
        productRepository.deleteById(id);
    }
}
