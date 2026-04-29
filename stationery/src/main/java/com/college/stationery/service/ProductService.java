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

    public List<Product> searchAndFilterProducts(String name, String category, Double minPrice, Double maxPrice, Boolean hasDiscount) {
        return productRepository.filterProducts(
            (name == null || name.isEmpty()) ? null : name,
            (category == null || category.isEmpty() || "All".equalsIgnoreCase(category)) ? null : category,
            minPrice,
            maxPrice,
            hasDiscount != null ? hasDiscount : false
        );
    }

    public List<Product> getLowStockProducts(int threshold) {
        return productRepository.findByQuantityLessThan(threshold);
    }

    public Optional<Product> getProductByName(String name) {
        return productRepository.findByName(name);
    }

    public Product saveProduct(Product product) {
        logger.info("Saving product: " + product.getName());
        return productRepository.save(product);
    }

    public Optional<Product> updateProduct(Long id, Product details) {
        logger.info("Updating product ID: " + id + " with details: " + details);
        return productRepository.findById(id).map(prod -> {
<<<<<<< HEAD
            prod.setName(details.getName());
            prod.setCategory(details.getCategory());
            prod.setPrice(details.getPrice());
            prod.setQuantity(details.getQuantity());
            prod.setDiscount(details.getDiscount());
            prod.setImageUrl(details.getImageUrl());
            prod.setCostPrice(details.getCostPrice());
            prod.setSalesCount(details.getSalesCount());
            prod.setSeasonalTag(details.getSeasonalTag());
            prod.setMonthlySales(details.getMonthlySales());
            return productRepository.save(prod);
=======
            logger.info("Current product found: " + prod.getName());
            if (details.getName() != null) prod.setName(details.getName());
            if (details.getCategory() != null) prod.setCategory(details.getCategory());
            if (details.getPrice() != null) prod.setPrice(details.getPrice());
            if (details.getQuantity() != null) prod.setQuantity(details.getQuantity());
            if (details.getDiscount() != null) prod.setDiscount(details.getDiscount());
            if (details.getImageUrl() != null) prod.setImageUrl(details.getImageUrl());
            
            Product updated = productRepository.save(prod);
            logger.info("Product updated successfully in DB");
            return updated;
>>>>>>> a8163695820187bd7b5dea38a10fa6a2dca9169a
        });
    }

    public List<Product> getLowStockProducts(Integer threshold) {
        logger.info("Fetching low stock products (threshold: " + threshold + ")");
        return productRepository.findByQuantityLessThan(threshold);
    }

    public void deleteProduct(Long id) {
        logger.info("Deleting product ID: " + id);
        productRepository.deleteById(id);
    }
}
