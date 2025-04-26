package com.example.backend.controller;

import com.example.backend.model.Category;
import com.example.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class CategoryController {

    private final CategoryService categoryService;

    // Tüm kategorileri getir
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.findAll());
    }

    // Ana kategorileri getir (Level 1)
    @GetMapping("/root")
    public ResponseEntity<List<Category>> getRootCategories() {
        return ResponseEntity.ok(categoryService.findRootCategories());
    }

    // Bir kategorinin alt kategorilerini getir
    @GetMapping("/{id}/subcategories")
    public ResponseEntity<List<Category>> getSubcategories(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.findSubcategoriesByParentId(id));
    }

    // Hiyerarşik kategori yapısını getir
    @GetMapping("/hierarchy")
    public ResponseEntity<List<Map<String, Object>>> getCategoryHierarchy() {
        return ResponseEntity.ok(categoryService.getCategoryHierarchy());
    }

    // Kategori detayını getir
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.findById(id));
    }

    // İsme göre kategori ara
    @GetMapping("/search")
    public ResponseEntity<List<Category>> searchCategories(@RequestParam String name) {
        return ResponseEntity.ok(categoryService.searchCategories(name));
    }

    @GetMapping("/debug/by-slug/{slug}")
    public ResponseEntity<?> debugCategoryBySlug(@PathVariable String slug) {
        try {
            System.out.println("DEBUG: Looking for category with slug: " + slug);
            Category category = categoryService.getCategoryBySlug(slug);
            if (category != null) {
                Map<String, Object> result = new HashMap<>();
                result.put("category", category);
                result.put("id", category.getId());
                result.put("slug", category.getSlug());
                result.put("parent", category.getParent() != null ? category.getParent().getId() : null);
                
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.status(404).body("Category not found with slug: " + slug);
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
} 