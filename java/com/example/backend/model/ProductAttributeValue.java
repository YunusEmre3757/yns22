package com.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "product_attribute_values")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductAttributeValue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", columnDefinition = "BIGINT")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, columnDefinition = "BIGINT")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attribute_id", nullable = false, columnDefinition = "BIGINT")
    private ProductAttribute attribute;

    @Column(name = "string_value")
    private String stringValue;

    @Column(name = "number_value")
    private Double numberValue;

    @Column(name = "boolean_value")
    private Boolean booleanValue;

    @Column(columnDefinition = "TEXT")
    private String selectValue;

    @ElementCollection
    @CollectionTable(name = "product_attribute_multi_values",
                    joinColumns = @JoinColumn(name = "attribute_value_id", columnDefinition = "BIGINT"))
    @Column(name = "value")
    private List<String> multiSelectValues;
} 