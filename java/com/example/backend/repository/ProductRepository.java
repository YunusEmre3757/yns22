package com.example.backend.repository;

import com.example.backend.model.Product;
import com.example.backend.model.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Ana sayfa için öne çıkan ürünleri getir
    List<Product> findByActiveAndFeaturedTrue(boolean active);
    
    // İndirimli ürünleri getir
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.minPrice < p.price")
    List<Product> findDiscountedProducts();
    
    // En çok satan ürünleri getir (örnek sorgu, gerçek implementasyona göre değişebilir)
    @Query(value = "SELECT p.* FROM products p JOIN (SELECT product_id, COUNT(*) as sale_count FROM order_items GROUP BY product_id ORDER BY sale_count DESC LIMIT 10) sales ON p.id = sales.product_id WHERE p.active = true", nativeQuery = true)
    List<Product> findBestSellers();
    
    // Yeni ürünleri getir
    Page<Product> findByActiveOrderByCreatedAtDesc(boolean active, Pageable pageable);
    
    // Slug ile ürün bul
    Optional<Product> findBySlug(String slug);
    
    // Kategori ID'sine göre ürünleri getir
    Page<Product> findByCategoryIdAndActive(Long categoryId, boolean active, Pageable pageable);
    
    // Kategori slug'ına göre ürünleri getir
    @Query("SELECT p FROM Product p JOIN p.category c WHERE LOWER(c.slug) = LOWER(:slug) AND p.active = true")
    Page<Product> findByCategorySlugAndActive(@Param("slug") String slug, Pageable pageable);
    
    // Basit sorgu - Kategori ID veya alt kategorilere göre ürünleri getir (List versiyonu)
    @Query(value = 
            "SELECT p.* FROM products p " +
            "JOIN categories c ON p.category_id = c.id " +
            "WHERE p.active = true AND " +
            "(c.id = :categoryId OR c.parent_id = :categoryId OR c.id IN " +
            "(SELECT id FROM categories WHERE parent_id IN " +
            "(SELECT id FROM categories WHERE parent_id = :categoryId)))",
            nativeQuery = true)
    List<Product> findByCategoryHierarchy(@Param("categoryId") Long categoryId);
    
    // Basit sorgu - Kategori ID veya alt kategorilere göre ürünleri getir (Page versiyonu)
    @Query(value = 
            "SELECT p.* FROM products p " +
            "JOIN categories c ON p.category_id = c.id " +
            "WHERE p.active = true AND " +
            "(c.id = :categoryId OR c.parent_id = :categoryId OR c.id IN " +
            "(SELECT id FROM categories WHERE parent_id IN " +
            "(SELECT id FROM categories WHERE parent_id = :categoryId)))",
            countQuery = 
            "SELECT COUNT(p.id) FROM products p " +
            "JOIN categories c ON p.category_id = c.id " +
            "WHERE p.active = true AND " +
            "(c.id = :categoryId OR c.parent_id = :categoryId OR c.id IN " +
            "(SELECT id FROM categories WHERE parent_id IN " +
            "(SELECT id FROM categories WHERE parent_id = :categoryId)))",
            nativeQuery = true)
    Page<Product> findByCategoryHierarchy(@Param("categoryId") Long categoryId, Pageable pageable);
    
    // Daha basit sorgu - Kategori ID veya alt kategorilere göre ürünleri getir
    @Query(value = 
            "SELECT p.* FROM products p " +
            "JOIN categories c ON p.category_id = c.id " +
            "WHERE p.active = true AND " +
            "(c.id = :categoryId OR c.parent_id = :categoryId)",
            nativeQuery = true)
    List<Product> findSimpleProductsByCategoryHierarchy(@Param("categoryId") Long categoryId);
    
    // Basit sorgu - Kategori slug veya alt kategorilere göre ürünleri getir (List versiyonu)
    @Query(value = 
            "SELECT DISTINCT p.* FROM products p " +
            "JOIN categories c ON p.category_id = c.id " +
            "WHERE p.active = true AND " +
            "(LOWER(c.slug) = LOWER(:slug) OR " + 
            "REPLACE(LOWER(c.slug), ' & ', '-') = LOWER(:slug) OR " +
            "REPLACE(LOWER(c.slug), '&', '') = LOWER(:slug) OR " +
            "c.parent_id IN (SELECT id FROM categories WHERE LOWER(slug) = LOWER(:slug) OR " +
            "REPLACE(LOWER(slug), ' & ', '-') = LOWER(:slug) OR " +
            "REPLACE(LOWER(slug), '&', '') = LOWER(:slug)) OR " +
            "c.id IN (SELECT id FROM categories WHERE parent_id IN " +
            "(SELECT id FROM categories WHERE LOWER(slug) = LOWER(:slug) OR " +
            "REPLACE(LOWER(slug), ' & ', '-') = LOWER(:slug) OR " +
            "REPLACE(LOWER(slug), '&', '') = LOWER(:slug))))",
            nativeQuery = true)
    List<Product> findByCategorySlugHierarchy(@Param("slug") String slug);
    
    // Basit sorgu - Kategori slug veya alt kategorilere göre ürünleri getir (Page versiyonu)
    @Query(value = 
            "SELECT DISTINCT p.* FROM products p " +
            "JOIN categories c ON p.category_id = c.id " +
            "WHERE p.active = true AND " +
            "(LOWER(c.slug) = LOWER(:slug) OR " + 
            "REPLACE(LOWER(c.slug), ' & ', '-') = LOWER(:slug) OR " +
            "REPLACE(LOWER(c.slug), '&', '') = LOWER(:slug) OR " +
            "c.parent_id IN (SELECT id FROM categories WHERE LOWER(slug) = LOWER(:slug) OR " +
            "REPLACE(LOWER(slug), ' & ', '-') = LOWER(:slug) OR " +
            "REPLACE(LOWER(slug), '&', '') = LOWER(:slug)) OR " +
            "c.id IN (SELECT id FROM categories WHERE parent_id IN " +
            "(SELECT id FROM categories WHERE LOWER(slug) = LOWER(:slug) OR " +
            "REPLACE(LOWER(slug), ' & ', '-') = LOWER(:slug) OR " +
            "REPLACE(LOWER(slug), '&', '') = LOWER(:slug))))",
            countQuery = 
            "SELECT COUNT(DISTINCT p.id) FROM products p " +
            "JOIN categories c ON p.category_id = c.id " +
            "WHERE p.active = true AND " +
            "(LOWER(c.slug) = LOWER(:slug) OR " + 
            "REPLACE(LOWER(c.slug), ' & ', '-') = LOWER(:slug) OR " +
            "REPLACE(LOWER(c.slug), '&', '') = LOWER(:slug) OR " +
            "c.parent_id IN (SELECT id FROM categories WHERE LOWER(slug) = LOWER(:slug) OR " +
            "REPLACE(LOWER(slug), ' & ', '-') = LOWER(:slug) OR " +
            "REPLACE(LOWER(slug), '&', '') = LOWER(:slug)) OR " +
            "c.id IN (SELECT id FROM categories WHERE parent_id IN " +
            "(SELECT id FROM categories WHERE LOWER(slug) = LOWER(:slug) OR " +
            "REPLACE(LOWER(slug), ' & ', '-') = LOWER(:slug) OR " +
            "REPLACE(LOWER(slug), '&', '') = LOWER(:slug))))",
            nativeQuery = true)
    Page<Product> findByCategorySlugHierarchy(@Param("slug") String slug, Pageable pageable);
    
    // Daha basit sorgu - Kategori slug veya alt kategorilere göre ürünleri getir
    @Query(value = 
            "SELECT DISTINCT p.* FROM products p " +
            "JOIN categories c ON p.category_id = c.id " +
            "WHERE p.active = true AND " +
            "(LOWER(c.slug) = LOWER(:slug) OR " + 
            "REPLACE(LOWER(c.slug), ' & ', '-') = LOWER(:slug) OR " +
            "REPLACE(LOWER(c.slug), '&', '') = LOWER(:slug) OR " +
            "c.parent_id IN (SELECT id FROM categories WHERE LOWER(slug) = LOWER(:slug) OR " +
            "REPLACE(LOWER(slug), ' & ', '-') = LOWER(:slug) OR " +
            "REPLACE(LOWER(slug), '&', '') = LOWER(:slug)))",
            nativeQuery = true)
    List<Product> findSimpleProductsByCategorySlugHierarchy(@Param("slug") String slug);
    
    // Arama sorgusu ile ürünleri getir
    @Query("SELECT p FROM Product p WHERE p.active = true AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);
    
    // Arama ve kategori filtreleme
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.category.id = :categoryId AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProductsByCategoryId(@Param("query") String query, @Param("categoryId") Long categoryId, Pageable pageable);
} 