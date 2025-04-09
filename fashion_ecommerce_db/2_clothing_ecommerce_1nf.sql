-- Fashion E-commerce Database - First Normal Form (1NF)

-- Drop tables if they exist
DROP TABLE IF EXISTS ClothingEcommerce_1NF;

-- Create 1NF table (with proper atomic values and a primary key)
-- In 1NF, we're ensuring all attributes contain atomic values
CREATE TABLE ClothingEcommerce_1NF (
    OrderID VARCHAR(10),
    ProductID VARCHAR(10),
    CustomerID VARCHAR(10),
    CustomerFirstName VARCHAR(50),
    CustomerLastName VARCHAR(50),
    CustomerEmail VARCHAR(100),
    CustomerPhone VARCHAR(20),
    CustomerAddress VARCHAR(100),
    CityID INT,
    CustomerCity VARCHAR(50),
    CountryID INT,
    CustomerCountry VARCHAR(50),
    OrderDate DATE,
    ShippingID INT,
    ShippingMethod VARCHAR(20),
    ShippingCost DECIMAL(10, 2),
    StatusID INT,
    OrderStatus VARCHAR(20),
    PaymentID INT,
    PaymentMethod VARCHAR(20),
    ProductName VARCHAR(50),
    ProductDescription VARCHAR(200),
    CategoryID INT,
    ProductCategory VARCHAR(30),
    SubCategoryID INT,
    ProductSubcategory VARCHAR(30),
    BrandID INT,
    BrandName VARCHAR(30),
    BrandCountryID INT,
    BrandCountry VARCHAR(50),
    Size VARCHAR(10),
    Color VARCHAR(20),
    MaterialID INT,
    Material VARCHAR(30),
    PatternID INT,
    Pattern VARCHAR(20),
    UnitPrice DECIMAL(10, 2),
    DiscountPercentage INT,
    StockQuantity INT,
    SupplierID VARCHAR(10),
    SupplierName VARCHAR(50),
    SupplierAddress VARCHAR(100),
    SupplierCityID INT,
    SupplierCity VARCHAR(50),
    SupplierContactPerson VARCHAR(50),
    SupplierPhone VARCHAR(20),
    SupplierEmail VARCHAR(100),
    PRIMARY KEY (OrderID, ProductID)
);

-- Migrate data from UNF to 1NF
-- We need to extract atomic values from concatenated strings and make a separate row for each product in an order
INSERT INTO ClothingEcommerce_1NF
WITH ProductsCTE AS (
    SELECT 
        OrderID,
        TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(ProductInfo, ';', n.n), ';', -1)) AS ProductEntry,
        CustomerInfo,
        CustomerAddress,
        OrderInfo,
        ProductDetails,
        BrandInfo,
        PriceInfo,
        SupplierInfo
    FROM 
        ClothingEcommerce_UNF
    JOIN 
        (SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) n
    ON 
        LENGTH(ProductInfo) - LENGTH(REPLACE(ProductInfo, ';', '')) >= n.n - 1
    OR 
        (n.n = 1 AND ProductInfo NOT LIKE '%;%')
)
SELECT
    p.OrderID,
    TRIM(SUBSTRING_INDEX(p.ProductEntry, ',', 1)) AS ProductID,
    TRIM(SUBSTRING_INDEX(p.CustomerInfo, '|', 1)) AS CustomerID,
    TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.CustomerInfo, '|', 2), '|', -1)) AS CustomerFirstName,
    TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.CustomerInfo, '|', 3), '|', -1)) AS CustomerLastName,
    TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.CustomerInfo, '|', 4), '|', -1)) AS CustomerEmail,
    TRIM(SUBSTRING_INDEX(p.CustomerInfo, '|', -1)) AS CustomerPhone,
    TRIM(SUBSTRING_INDEX(p.CustomerAddress, '|', 1)) AS CustomerAddress,
    CAST(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.CustomerAddress, '|', 2), '|', -1)) AS SIGNED INTEGER) AS CityID,
    TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.CustomerAddress, '|', 3), '|', -1)) AS CustomerCity,
    CAST(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.CustomerAddress, '|', 4), '|', -1)) AS SIGNED INTEGER) AS CountryID,
    TRIM(SUBSTRING_INDEX(p.CustomerAddress, '|', -1)) AS CustomerCountry,
    CAST(TRIM(SUBSTRING_INDEX(p.OrderInfo, '|', 1)) AS DATE) AS OrderDate,
    CAST(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.OrderInfo, '|', 2), '|', -1)) AS SIGNED INTEGER) AS ShippingID,
    TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.OrderInfo, '|', 3), '|', -1)) AS ShippingMethod,
    CAST(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.OrderInfo, '|', 4), '|', -1)) AS DECIMAL(10,2)) AS ShippingCost,
    CAST(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.OrderInfo, '|', 5), '|', -1)) AS SIGNED INTEGER) AS StatusID,
    TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.OrderInfo, '|', 6), '|', -1)) AS OrderStatus,
    CAST(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.OrderInfo, '|', 7), '|', -1)) AS SIGNED INTEGER) AS PaymentID,
    TRIM(SUBSTRING_INDEX(p.OrderInfo, '|', -1)) AS PaymentMethod,
    TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.ProductEntry, ',', 2), ',', -1)) AS ProductName,
    TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.ProductEntry, ',', 3), ',', -1)) AS ProductDescription,
    CAST(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.ProductEntry, ',', 4), ',', -1)) AS SIGNED INTEGER) AS CategoryID,
    TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.ProductEntry, ',', 5), ',', -1)) AS ProductCategory,
    CAST(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.ProductEntry, ',', 6), ',', -1)) AS SIGNED INTEGER) AS SubCategoryID,
    TRIM(SUBSTRING_INDEX(p.ProductEntry, ',', -1)) AS ProductSubcategory,
    CAST(TRIM(SUBSTRING_INDEX(p.BrandInfo, '|', 1)) AS SIGNED INTEGER) AS BrandID,
    TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.BrandInfo, '|', 2), '|', -1)) AS BrandName,
    CAST(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.BrandInfo, '|', 3), '|', -1)) AS SIGNED INTEGER) AS BrandCountryID,
    TRIM(SUBSTRING_INDEX(p.BrandInfo, '|', -1)) AS BrandCountry,
    TRIM(SUBSTRING_INDEX(p.ProductDetails, '|', 1)) AS Size,
    TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.ProductDetails, '|', 2), '|', -1)) AS Color,
    CAST(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.ProductDetails, '|', 3), '|', -1)) AS SIGNED INTEGER) AS MaterialID,
    TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.ProductDetails, '|', 4), '|', -1)) AS Material,
    CAST(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.ProductDetails, '|', 5), '|', -1)) AS SIGNED INTEGER) AS PatternID,
    TRIM(SUBSTRING_INDEX(p.ProductDetails, '|', -1)) AS Pattern,
    CAST(TRIM(SUBSTRING_INDEX(p.PriceInfo, '|', 1)) AS DECIMAL(10,2)) AS UnitPrice,
    CAST(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.PriceInfo, '|', 2), '|', -1)) AS SIGNED INTEGER) AS DiscountPercentage,
    CAST(TRIM(SUBSTRING_INDEX(p.PriceInfo, '|', -1)) AS SIGNED INTEGER) AS StockQuantity,
    TRIM(SUBSTRING_INDEX(p.SupplierInfo, '|', 1)) AS SupplierID,
    TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.SupplierInfo, '|', 2), '|', -1)) AS SupplierName,
    TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.SupplierInfo, '|', 3), '|', -1)) AS SupplierAddress,
    CAST(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.SupplierInfo, '|', 4), '|', -1)) AS SIGNED INTEGER) AS SupplierCityID,
    TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.SupplierInfo, '|', 5), '|', -1)) AS SupplierCity,
    TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.SupplierInfo, '|', 6), '|', -1)) AS SupplierContactPerson,
    TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.SupplierInfo, '|', 7), '|', -1)) AS SupplierPhone,
    TRIM(SUBSTRING_INDEX(p.SupplierInfo, '|', -1)) AS SupplierEmail
FROM 
    ProductsCTE p
WHERE 
    p.ProductEntry IS NOT NULL AND p.ProductEntry != '';

-- Note: This script uses MySQL's specific string functions to parse the concatenated data
-- The approach splits semicolon-separated products into rows and extracts pipe-delimited fields into columns
-- In a true production system, this parsing logic would be more robust to handle edge cases 