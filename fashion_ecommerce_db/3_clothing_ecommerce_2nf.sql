-- Fashion E-commerce Database - Second Normal Form (2NF)

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS OrderItem_2NF;
DROP TABLE IF EXISTS Order_2NF;
DROP TABLE IF EXISTS Product_2NF;
DROP TABLE IF EXISTS Customer_2NF;
DROP TABLE IF EXISTS Supplier_2NF;
DROP TABLE IF EXISTS Brand_2NF;

-- Create 2NF tables (eliminate partial dependencies)
-- Customer table
CREATE TABLE Customer_2NF (
    CustomerID VARCHAR(10) PRIMARY KEY,
    CustomerFirstName VARCHAR(50),
    CustomerLastName VARCHAR(50),
    CustomerEmail VARCHAR(100),
    CustomerPhone VARCHAR(20),
    CustomerAddress VARCHAR(100),
    CityID INT,
    CustomerCity VARCHAR(50),
    CountryID INT,
    CustomerCountry VARCHAR(50)
);

-- Brand table
CREATE TABLE Brand_2NF (
    BrandID INT PRIMARY KEY,
    BrandName VARCHAR(30) UNIQUE,
    CountryID INT,
    BrandCountry VARCHAR(50)
);

-- Supplier table
CREATE TABLE Supplier_2NF (
    SupplierID VARCHAR(10) PRIMARY KEY,
    SupplierName VARCHAR(50),
    SupplierAddress VARCHAR(100),
    SupplierCityID INT,
    SupplierCity VARCHAR(50),
    SupplierContactPerson VARCHAR(50),
    SupplierPhone VARCHAR(20),
    SupplierEmail VARCHAR(100)
);

-- Product table 
CREATE TABLE Product_2NF (
    ProductID VARCHAR(10) PRIMARY KEY,
    ProductName VARCHAR(50),
    ProductDescription VARCHAR(200),
    CategoryID INT,
    ProductCategory VARCHAR(30),
    SubCategoryID INT,
    ProductSubcategory VARCHAR(30),
    BrandID INT,
    BrandName VARCHAR(30),
    Size VARCHAR(10),
    Color VARCHAR(20),
    MaterialID INT,
    Material VARCHAR(30),
    PatternID INT,
    Pattern VARCHAR(20),
    UnitPrice DECIMAL(10, 2),
    StockQuantity INT,
    SupplierID VARCHAR(10),
    FOREIGN KEY (BrandID) REFERENCES Brand_2NF(BrandID),
    FOREIGN KEY (SupplierID) REFERENCES Supplier_2NF(SupplierID)
);

-- Order table
CREATE TABLE Order_2NF (
    OrderID VARCHAR(10) PRIMARY KEY,
    CustomerID VARCHAR(10),
    OrderDate DATE,
    ShippingID INT,
    ShippingMethod VARCHAR(20),
    ShippingCost DECIMAL(10, 2),
    StatusID INT,
    OrderStatus VARCHAR(20),
    PaymentID INT,
    PaymentMethod VARCHAR(20),
    FOREIGN KEY (CustomerID) REFERENCES Customer_2NF(CustomerID)
);

-- OrderItem table (composite key based on OrderID and ProductID)
CREATE TABLE OrderItem_2NF (
    OrderID VARCHAR(10),
    ProductID VARCHAR(10),
    UnitPrice DECIMAL(10, 2),
    DiscountPercentage INT,
    PRIMARY KEY (OrderID, ProductID),
    FOREIGN KEY (OrderID) REFERENCES Order_2NF(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Product_2NF(ProductID)
);

-- Migrate data from 1NF to 2NF

-- Insert unique customer records
INSERT INTO Customer_2NF
SELECT DISTINCT 
    CustomerID,
    CustomerFirstName,
    CustomerLastName,
    CustomerEmail,
    CustomerPhone,
    CustomerAddress,
    CityID,
    CustomerCity,
    CountryID,
    CustomerCountry
FROM ClothingEcommerce_1NF;

-- Insert unique brand records
INSERT INTO Brand_2NF
SELECT DISTINCT 
    BrandID,
    BrandName,
    BrandCountryID,
    BrandCountry
FROM ClothingEcommerce_1NF;

-- Insert unique supplier records
INSERT INTO Supplier_2NF
SELECT DISTINCT 
    SupplierID,
    SupplierName,
    SupplierAddress,
    SupplierCityID,
    SupplierCity,
    SupplierContactPerson,
    SupplierPhone,
    SupplierEmail
FROM ClothingEcommerce_1NF;

-- Insert unique product records
INSERT INTO Product_2NF
SELECT DISTINCT 
    ProductID,
    ProductName,
    ProductDescription,
    CategoryID,
    ProductCategory,
    SubCategoryID,
    ProductSubcategory,
    BrandID,
    BrandName,
    Size,
    Color,
    MaterialID,
    Material,
    PatternID,
    Pattern,
    UnitPrice,
    StockQuantity,
    SupplierID
FROM ClothingEcommerce_1NF;

-- Insert unique order records
INSERT INTO Order_2NF
SELECT DISTINCT 
    OrderID,
    CustomerID,
    OrderDate,
    ShippingID,
    ShippingMethod,
    ShippingCost,
    StatusID,
    OrderStatus,
    PaymentID,
    PaymentMethod
FROM ClothingEcommerce_1NF;

-- Insert order items
INSERT INTO OrderItem_2NF
SELECT 
    OrderID,
    ProductID,
    UnitPrice,
    DiscountPercentage
FROM ClothingEcommerce_1NF; 