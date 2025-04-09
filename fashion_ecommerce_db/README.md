# Fashion E-commerce Database Normalization Project

This project demonstrates the process of database normalization from an unnormalized form (UNF) to the Third Normal Form (3NF) for a fashion e-commerce system.

## Project Files

1. `1_clothing_ecommerce_unf.sql` - Unnormalized (UNF) database schema and sample data
2. `2_clothing_ecommerce_1nf.sql` - First Normal Form (1NF) database schema and data migration
3. `3_clothing_ecommerce_2nf.sql` - Second Normal Form (2NF) database schema and data migration
4. `4_clothing_ecommerce_3nf.sql` - Third Normal Form (3NF) database schema and data migration
5. `er_diagram_instructions.txt` - Instructions for drawing the ER diagram

## Normalization Process

### Unnormalized Form (UNF)
- Data is stored with non-atomic values (violating 1NF requirements)
- Contains compound attributes with delimiter-separated values (using | and ; as delimiters)
- Multiple values stored in single fields, for example:
  - CustomerInfo: "CUST001|John|Smith|john.smith@email.com|+1-555-123-4567"
  - ProductInfo: "PROD001,Classic T-Shirt,Comfortable cotton T-shirt,Clothing,T-shirts;PROD005,Denim Jeans,Classic fit denim jeans,Clothing,Jeans"
  - BrandInfo: "FashionBrand|USA"
  - Multiple products can be stored in a single order row

### First Normal Form (1NF)
- Transformed non-atomic values into atomic values
- Created separate rows for each product in an order
- Used SQL string manipulation to parse the compound attributes into individual columns
- Created a composite primary key (OrderID, ProductID)
- Each attribute now contains only a single value in its domain

### Second Normal Form (2NF)
- Eliminated partial dependencies by separating tables based on entities
- Created separate tables for Customer, Brand, Supplier, Product, Order, and OrderItem
- Established appropriate primary keys for each table
- Created foreign key relationships between tables
- Each non-key attribute is now fully dependent on the entire primary key

### Third Normal Form (3NF)
- Eliminated transitive dependencies by extracting reference data to separate tables
- Created lookup tables for Country, City, Material, Pattern, ShippingMethod, OrderStatus, and PaymentMethod
- Each non-key attribute now depends only on the primary key, not on other non-key attributes
- Created a database view to reconstruct the original UNF dataset for comparison

## Challenges in Normalization

This project highlights several normalization challenges:

1. **Data Extraction** - Converting non-atomic values to atomic values required complex string parsing
2. **Multiple Values in Single Fields** - The UNF schema contained multiple product entries per order row
3. **Hierarchical Data** - Categories and subcategories required a self-referencing relationship
4. **Multi-valued Dependencies** - Many-to-many relationships between orders and products required junction tables

## Entity-Relationship Diagram

The ER diagram shows all entities (tables) in the 3NF database with:
- Attributes (columns) for each entity
- Primary keys (PK) and foreign keys (FK)
- Relationships between entities with proper cardinality notation (1, 0..1, 1..*, 0..*)

## Data

The database contains sample data for a fashion e-commerce system including:
- Products (clothing, footwear, accessories)
- Customers
- Orders and order items
- Suppliers
- Product attributes (size, color, material, pattern)
- Brands
- Categories and subcategories
- Shipping, payment, and order status information

This project fulfills the requirements for CSE 204 Group Project Assignment 1. 