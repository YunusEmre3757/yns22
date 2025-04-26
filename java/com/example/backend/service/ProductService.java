package com.example.backend.service;

import com.example.backend.model.Product;
import com.example.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    // Tüm ürünleri sayfalama ve filtreleme ile getir
    public Map<String, Object> getProducts(int page, int size, String sort, String category, String search) {
        Sort.Direction direction = Sort.Direction.ASC;
        String property = "id";
        
        if (sort != null && !sort.isEmpty()) {
            String[] sortParams = sort.split(",");
            if (sortParams.length > 1) {
                direction = sortParams[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            }
            property = sortParams[0];
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, property));
        Page<Product> productPage;
        
        if (search != null && !search.isEmpty() && category != null && !category.isEmpty()) {
            try {
                Long categoryId = Long.parseLong(category);
                productPage = productRepository.searchProductsByCategoryId(search, categoryId, pageable);
            } catch (NumberFormatException e) {
                productPage = productRepository.findByCategorySlugAndActive(category, pageable);
            }
        } else if (search != null && !search.isEmpty()) {
            productPage = productRepository.searchProducts(search, pageable);
        } else if (category != null && !category.isEmpty()) {
            try {
                // Sayısal ID ise 
                Long categoryId = Long.parseLong(category);
                // Alt kategorileri de içerecek şekilde ürünleri getir
                productPage = productRepository.findByCategoryHierarchy(categoryId, pageable);
            } catch (NumberFormatException e) {
                // Slug ise
                // Alt kategorileri de içerecek şekilde ürünleri getir
                productPage = productRepository.findByCategorySlugHierarchy(category, pageable); 
            }
        } else {
            productPage = productRepository.findAll(pageable);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("items", productPage.getContent());
        response.put("total", productPage.getTotalElements());
        
        return response;
    }

    // Öne çıkan ürünleri getir
    public List<Product> getFeaturedProducts() {
        return productRepository.findByActiveAndFeaturedTrue(true);
    }

    // Tek bir ürün detayını getir
    public Product getProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    // Kategoriye göre ürünleri getir - alt kategorileri içerir
    public List<Product> getProductsByCategory(Long categoryId) {
        try {
            // Önce daha basit sorguyu dene
            List<Product> products = productRepository.findSimpleProductsByCategoryHierarchy(categoryId);
            if (products != null && !products.isEmpty()) {
                return products;
            }
            
            // Eğer başarısız olursa veya sonuç yoksa, daha karmaşık sorguyu kullan
            Pageable pageable = PageRequest.of(0, 100);
            return productRepository.findByCategoryHierarchy(categoryId, pageable).getContent();
        } catch (Exception e) {
            // Hata durumunda sadece kategori ID'si ile ürünleri getir
            System.out.println("Kategori hiyerarşi sorgusu başarısız: " + e.getMessage());
            Pageable pageable = PageRequest.of(0, 100);
            return productRepository.findByCategoryIdAndActive(categoryId, true, pageable).getContent();
        }
    }
    
    // Kategori slug'ına göre ürünleri getir - alt kategorileri içerir
    public List<Product> getProductsByCategorySlug(String slug) {
        System.out.println("DEBUG: Looking for products with category slug: " + slug);
        try {
            // Önce daha basit sorguyu dene
            List<Product> products = productRepository.findSimpleProductsByCategorySlugHierarchy(slug);
            System.out.println("DEBUG: Simple query result count: " + (products != null ? products.size() : 0));
            if (products != null && !products.isEmpty()) {
                return products;
            }
            
            // Eğer başarısız olursa veya sonuç yoksa, daha karmaşık sorguyu kullan
            Pageable pageable = PageRequest.of(0, 100);
            List<Product> pageProducts = productRepository.findByCategorySlugHierarchy(slug, pageable).getContent();
            System.out.println("DEBUG: Complex query result count: " + (pageProducts != null ? pageProducts.size() : 0));
            return pageProducts;
        } catch (Exception e) {
            // Hata durumunda sadece kategori slug'ı ile ürünleri getir
            System.out.println("DEBUG: Category slug hierarchy query failed: " + e.getMessage());
            e.printStackTrace();
            Pageable pageable = PageRequest.of(0, 100);
            List<Product> fallbackProducts = productRepository.findByCategorySlugAndActive(slug, pageable).getContent();
            System.out.println("DEBUG: Fallback query result count: " + (fallbackProducts != null ? fallbackProducts.size() : 0));
            return fallbackProducts;
        }
    }

    // İndirimli ürünleri getir
    public List<Product> getDiscountedProducts() {
        return productRepository.findDiscountedProducts();
    }

    // En çok satanları getir
    public List<Product> getBestSellers() {
        return productRepository.findBestSellers();
    }

    // Yeni ürünleri getir
    public List<Product> getNewArrivals() {
        Pageable pageable = PageRequest.of(0, 10);
        return productRepository.findByActiveOrderByCreatedAtDesc(true, pageable).getContent();
    }

    // Slug ile ürün getir
    public Product getProductBySlug(String slug) {
        return productRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Product not found with slug: " + slug));
    }

    // Yeni ürün ekle
    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    // Ürün güncelle
    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProduct(id);
        
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setStock(productDetails.getStock());
        product.setImageUrl(productDetails.getImageUrl());
        
        if (productDetails.getCategory() != null) {
            product.setCategory(productDetails.getCategory());
        }
        
        return productRepository.save(product);
    }

    // Ürün sil
    public void deleteProduct(Long id) {
        Product product = getProduct(id);
        productRepository.delete(product);
    }

    public List<Product> getProductsByCategoryHierarchy(Long categoryId) {
        return productRepository.findByCategoryHierarchy(categoryId);
    }

    public List<Product> getProductsByCategorySlugHierarchy(String slug) {
        return productRepository.findByCategorySlugHierarchy(slug);
    }
} 