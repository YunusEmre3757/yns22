
package com.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "product_attributes")
@Data
@NoArgsConstructor
public class ProductAttribute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", columnDefinition = "BIGINT")
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // STRING, NUMBER, BOOLEAN, SELECT, MULTI_SELECT

    @Column(nullable = false)
    private boolean required;

    @Column(nullable = false)
    private boolean searchable;

    @Column(nullable = false)
    private boolean filterable;

    @Column(nullable = false)
    private boolean sortable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false, columnDefinition = "BIGINT")
    private Category category;

    @ElementCollection
    @CollectionTable(name = "product_attribute_options", 
                    joinColumns = @JoinColumn(name = "attribute_id", columnDefinition = "BIGINT"))
    @Column(name = "option_value")
    private List<String> options;

    @Column(nullable = false)
    private boolean active = true;
} 