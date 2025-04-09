-- Fashion E-commerce Database - Third Normal Form (3NF)

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS OrderItem_3NF;
DROP TABLE IF EXISTS Order_3NF;
DROP TABLE IF EXISTS Product_3NF;
DROP TABLE IF EXISTS Customer_3NF;
DROP TABLE IF EXISTS Supplier_3NF;
DROP TABLE IF EXISTS City_3NF;
DROP TABLE IF EXISTS Country_3NF;
DROP TABLE IF EXISTS SubCategory_3NF;
DROP TABLE IF EXISTS Category_3NF;
DROP TABLE IF EXISTS Brand_3NF;
DROP TABLE IF EXISTS Material_3NF;
DROP TABLE IF EXISTS Pattern_3NF;
DROP TABLE IF EXISTS ShippingMethod_3NF;
DROP TABLE IF EXISTS OrderStatus_3NF;
DROP TABLE IF EXISTS PaymentMethod_3NF;

-- Create base tables without dependencies
CREATE TABLE Country_3NF (
    CountryID INT PRIMARY KEY,
    CountryName VARCHAR(50) UNIQUE
);

CREATE TABLE Material_3NF (
    MaterialID INT PRIMARY KEY,
    MaterialName VARCHAR(30) UNIQUE
);

CREATE TABLE Pattern_3NF (
    PatternID INT PRIMARY KEY,
    PatternName VARCHAR(20) UNIQUE
);

CREATE TABLE ShippingMethod_3NF (
    ShippingID INT PRIMARY KEY,
    MethodName VARCHAR(20) UNIQUE,
    Cost DECIMAL(10, 2)
);

CREATE TABLE OrderStatus_3NF (
    StatusID INT PRIMARY KEY,
    StatusName VARCHAR(20) UNIQUE
);

CREATE TABLE PaymentMethod_3NF (
    PaymentID INT PRIMARY KEY,
    MethodName VARCHAR(20) UNIQUE
);

-- Create tables with simple foreign key dependencies
CREATE TABLE City_3NF (
    CityID INT PRIMARY KEY,
    CityName VARCHAR(50),
    CountryID INT,
    FOREIGN KEY (CountryID) REFERENCES Country_3NF(CountryID)
);

CREATE TABLE Brand_3NF (
    BrandID INT PRIMARY KEY,
    BrandName VARCHAR(30) UNIQUE,
    CountryID INT,
    FOREIGN KEY (CountryID) REFERENCES Country_3NF(CountryID)
);

CREATE TABLE Category_3NF (
    CategoryID INT PRIMARY KEY,
    CategoryName VARCHAR(30) UNIQUE
);

CREATE TABLE SubCategory_3NF (
    SubCategoryID INT PRIMARY KEY,
    SubCategoryName VARCHAR(30) UNIQUE,
    CategoryID INT,
    FOREIGN KEY (CategoryID) REFERENCES Category_3NF(CategoryID)
);

-- Create tables with more complex dependencies
CREATE TABLE Customer_3NF (
    CustomerID VARCHAR(10) PRIMARY KEY,
    CustomerFirstName VARCHAR(50),
    CustomerLastName VARCHAR(50),
    CustomerEmail VARCHAR(100),
    CustomerPhone VARCHAR(20),
    CustomerAddress VARCHAR(100),
    CityID INT,
    FOREIGN KEY (CityID) REFERENCES City_3NF(CityID)
);

CREATE TABLE Supplier_3NF (
    SupplierID VARCHAR(10) PRIMARY KEY,
    SupplierName VARCHAR(50),
    SupplierAddress VARCHAR(100),
    SupplierContactPerson VARCHAR(50),
    SupplierPhone VARCHAR(20),
    SupplierEmail VARCHAR(100),
    CityID INT,
    FOREIGN KEY (CityID) REFERENCES City_3NF(CityID)
);

CREATE TABLE Product_3NF (
    ProductID VARCHAR(10) PRIMARY KEY,
    ProductName VARCHAR(50),
    ProductDescription VARCHAR(200),
    SubCategoryID INT,
    BrandID INT,
    Size VARCHAR(10),
    Color VARCHAR(20),
    MaterialID INT,
    PatternID INT,
    UnitPrice DECIMAL(10, 2),
    StockQuantity INT,
    SupplierID VARCHAR(10),
    FOREIGN KEY (SubCategoryID) REFERENCES SubCategory_3NF(SubCategoryID),
    FOREIGN KEY (BrandID) REFERENCES Brand_3NF(BrandID),
    FOREIGN KEY (MaterialID) REFERENCES Material_3NF(MaterialID),
    FOREIGN KEY (PatternID) REFERENCES Pattern_3NF(PatternID),
    FOREIGN KEY (SupplierID) REFERENCES Supplier_3NF(SupplierID)
);

CREATE TABLE Order_3NF (
    OrderID VARCHAR(10) PRIMARY KEY,
    CustomerID VARCHAR(10),
    OrderDate DATE,
    ShippingID INT,
    StatusID INT,
    PaymentID INT,
    FOREIGN KEY (CustomerID) REFERENCES Customer_3NF(CustomerID),
    FOREIGN KEY (ShippingID) REFERENCES ShippingMethod_3NF(ShippingID),
    FOREIGN KEY (StatusID) REFERENCES OrderStatus_3NF(StatusID),
    FOREIGN KEY (PaymentID) REFERENCES PaymentMethod_3NF(PaymentID)
);

CREATE TABLE OrderItem_3NF (
    OrderID VARCHAR(10),
    ProductID VARCHAR(10),
    UnitPrice DECIMAL(10, 2),
    DiscountPercentage INT,
    PRIMARY KEY (OrderID, ProductID),
    FOREIGN KEY (OrderID) REFERENCES Order_3NF(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Product_3NF(ProductID)
);

-- Insert data from 2NF to 3NF

-- First populate the reference tables
-- Insert unique country values
INSERT INTO Country_3NF
SELECT DISTINCT 
    CountryID,
    CustomerCountry
FROM Customer_2NF;

-- Insert unique country values from Brand_2NF
INSERT INTO Country_3NF
SELECT DISTINCT CountryID, BrandCountry
FROM Brand_2NF
WHERE CountryID NOT IN (SELECT CountryID FROM Country_3NF);

-- Insert unique material values
INSERT INTO Material_3NF
SELECT DISTINCT 
    MaterialID,
    Material
FROM Product_2NF
WHERE MaterialID IS NOT NULL
GROUP BY MaterialID, Material;

-- Insert unique pattern values
INSERT INTO Pattern_3NF
SELECT DISTINCT 
    PatternID,
    Pattern
FROM Product_2NF
WHERE PatternID IS NOT NULL
GROUP BY PatternID, Pattern;

-- Insert unique shipping methods
INSERT INTO ShippingMethod_3NF
SELECT DISTINCT 
    ShippingID,
    ShippingMethod,
    ShippingCost
FROM Order_2NF;

-- Insert unique order statuses
INSERT INTO OrderStatus_3NF
SELECT DISTINCT 
    StatusID,
    OrderStatus
FROM Order_2NF;

-- Insert unique payment methods
INSERT INTO PaymentMethod_3NF
SELECT DISTINCT 
    PaymentID,
    PaymentMethod
FROM Order_2NF;

-- Insert cities with country references
INSERT INTO City_3NF
SELECT DISTINCT 
    CityID,
    CustomerCity,
    CountryID
FROM Customer_2NF;

-- Insert unique cities from supplier data
INSERT IGNORE INTO City_3NF
SELECT DISTINCT 
    SupplierCityID,
    SupplierCity,
    (SELECT CountryID FROM Country_3NF LIMIT 1) -- Default country if unknown
FROM Supplier_2NF
WHERE SupplierCityID IS NOT NULL;

-- Insert brands with country references
INSERT INTO Brand_3NF
SELECT DISTINCT 
    BrandID,
    BrandName,
    CountryID
FROM Brand_2NF;

-- Insert product categories 
INSERT INTO Category_3NF
SELECT DISTINCT 
    CategoryID,
    ProductCategory
FROM Product_2NF;

-- Insert subcategories
INSERT INTO SubCategory_3NF
SELECT DISTINCT 
    SubCategoryID,
    ProductSubcategory,
    CategoryID
FROM Product_2NF;

-- Insert customers with city references
INSERT INTO Customer_3NF
SELECT 
    CustomerID,
    CustomerFirstName,
    CustomerLastName,
    CustomerEmail,
    CustomerPhone,
    CustomerAddress,
    CityID
FROM Customer_2NF;

-- Insert suppliers with city references
INSERT INTO Supplier_3NF
SELECT 
    SupplierID,
    SupplierName,
    SupplierAddress,
    SupplierContactPerson,
    SupplierPhone,
    SupplierEmail,
    SupplierCityID
FROM Supplier_2NF;

-- Insert products with all their references
INSERT INTO Product_3NF
SELECT 
    ProductID,
    ProductName,
    ProductDescription,
    SubCategoryID,
    BrandID,
    Size,
    Color,
    MaterialID,
    PatternID,
    UnitPrice,
    StockQuantity,
    SupplierID
FROM Product_2NF;

-- Insert orders with all their references
INSERT INTO Order_3NF
SELECT 
    OrderID,
    CustomerID,
    OrderDate,
    ShippingID,
    StatusID,
    PaymentID
FROM Order_2NF;

-- Insert order items
INSERT INTO OrderItem_3NF
SELECT 
    OrderID,
    ProductID,
    UnitPrice,
    DiscountPercentage
FROM OrderItem_2NF;

CREATE OR REPLACE VIEW ClothingEcommerce_UNF_View AS
SELECT 
    o.OrderID,
    CONCAT(c.CustomerID, '|', c.CustomerFirstName, '|', c.CustomerLastName, '|', c.CustomerEmail, '|', c.CustomerPhone) AS CustomerInfo,
    CONCAT(c.CustomerAddress, '|', c.CityID, '|', ct.CityName, '|', co.CountryID, '|', co.CountryName) AS CustomerAddress,
    CONCAT(o.OrderDate, '|', o.ShippingID, '|', sm.MethodName, '|', sm.Cost, '|', o.StatusID, '|', os.StatusName, '|', o.PaymentID, '|', pm.MethodName) AS OrderInfo,
    GROUP_CONCAT(
        CONCAT(p.ProductID, ',', p.ProductName, ',', p.ProductDescription, ',', 
               cat.CategoryID, ',', cat.CategoryName, ',', p.SubCategoryID, ',', subcat.SubCategoryName)
        ORDER BY p.ProductID
        SEPARATOR ';'
    ) AS ProductInfo,
    MAX(CONCAT(p.Size, '|', p.Color, '|', p.MaterialID, '|', m.MaterialName, '|', p.PatternID, '|', pt.PatternName)) AS ProductDetails,
    MAX(CONCAT(p.BrandID, '|', b.BrandName, '|', b.CountryID, '|', co_brand.CountryName)) AS BrandInfo,
    MAX(CONCAT(p.UnitPrice, '|', oi.DiscountPercentage, '|', p.StockQuantity)) AS PriceInfo,
    MAX(CONCAT(s.SupplierID, '|', s.SupplierName, '|', s.SupplierAddress, '|', 
               s.CityID, '|', supplier_city.CityName, '|', s.SupplierContactPerson, '|', s.SupplierPhone, '|', s.SupplierEmail)) AS SupplierInfo
FROM Order_3NF o
JOIN Customer_3NF c ON o.CustomerID = c.CustomerID
JOIN City_3NF ct ON c.CityID = ct.CityID
JOIN Country_3NF co ON ct.CountryID = co.CountryID
JOIN ShippingMethod_3NF sm ON o.ShippingID = sm.ShippingID
JOIN OrderStatus_3NF os ON o.StatusID = os.StatusID
JOIN PaymentMethod_3NF pm ON o.PaymentID = pm.PaymentID
JOIN OrderItem_3NF oi ON o.OrderID = oi.OrderID
JOIN Product_3NF p ON oi.ProductID = p.ProductID
JOIN SubCategory_3NF subcat ON p.SubCategoryID = subcat.SubCategoryID
JOIN Category_3NF cat ON subcat.CategoryID = cat.CategoryID
JOIN Brand_3NF b ON p.BrandID = b.BrandID
JOIN Country_3NF co_brand ON b.CountryID = co_brand.CountryID
JOIN Material_3NF m ON p.MaterialID = m.MaterialID
JOIN Pattern_3NF pt ON p.PatternID = pt.PatternID
JOIN Supplier_3NF s ON p.SupplierID = s.SupplierID
LEFT JOIN City_3NF supplier_city ON s.CityID = supplier_city.CityID
GROUP BY o.OrderID;