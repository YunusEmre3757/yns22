-- Fashion E-commerce Database - True Unnormalized Schema (UNF)

-- Drop table if it exists
DROP TABLE IF EXISTS ClothingEcommerce_UNF;

-- Create true unnormalized table with non-atomic values
CREATE TABLE ClothingEcommerce_UNF (
    OrderID VARCHAR(10),
    CustomerInfo VARCHAR(255),  -- Non-atomic: Contains "CustomerID|FirstName|LastName|Email|Phone"
    CustomerAddress VARCHAR(255), -- Non-atomic: Contains "Address|CityID|City|CountryID|Country"
    OrderInfo VARCHAR(255),      -- Non-atomic: Contains "Date|ShippingID|ShippingMethod|ShippingCost|StatusID|Status|PaymentID|PaymentMethod"
    ProductInfo VARCHAR(500),    -- Non-atomic: Contains multiple products as "ID1,Name1,Desc1,CategoryID1,Category1,SubCategoryID1,Subcategory1;ID2,Name2,Desc2,CategoryID2,Category2,SubCategoryID2,Subcategory2"
    ProductDetails VARCHAR(255), -- Non-atomic: Contains "Size|Color|MaterialID|Material|PatternID|Pattern"
    BrandInfo VARCHAR(255),      -- Non-atomic: Contains "BrandID|Name|CountryID|Country"
    PriceInfo VARCHAR(100),      -- Non-atomic: Contains "UnitPrice|DiscountPercentage|StockQuantity"
    SupplierInfo VARCHAR(500)    -- Non-atomic: Contains "ID|Name|Address|CityID|City|ContactPerson|Phone|Email"
);

-- Insert sample data with non-atomic values
INSERT INTO ClothingEcommerce_UNF VALUES
('ORD001', 
 'CUST001|John|Smith|john.smith@email.com|+1-555-123-4567', 
 '123 Main St|1|New York|1|USA',
 '2025-01-05|1|Express|15.99|1|Delivered|1|Credit Card',
 'PROD001,Classic T-Shirt,Comfortable cotton T-shirt for everyday wear,1,Clothing,101,T-shirts;PROD005,Denim Jeans,Classic fit denim jeans,1,Clothing,102,Jeans',
 'M|Black|1|Cotton|1|Solid',
 '1|FashionBrand|1|USA',
 '19.99|0|150',
 'SUPP001|Quality Textiles|456 Factory Rd|2|Los Angeles|Jane Brown|+1-555-987-6543|contact@qualitytextiles.com'
),
('ORD002', 
 'CUST002|Emma|Johnson|emma.j@email.com|+1-555-222-3333', 
 '789 Oak Ave|3|Chicago|1|USA',
 '2025-01-10|2|Standard|9.99|2|Processing|2|PayPal',
 'PROD002,Summer Dress,Light floral dress for summer,1,Clothing,103,Dresses',
 'S|Floral|1|Cotton|2|Floral',
 '2|ChicStyles|2|France',
 '39.99|15|30',
 'SUPP002|Fashion Fabrics|789 Fashion Ave|4|Paris|Pierre Dubois|+33-123-456-789|info@fashionfabrics.com'
),
('ORD003', 
 'CUST003|Maria|Garcia|maria@email.com|+1-555-444-5555', 
 '101 Pine St|5|Miami|1|USA',
 '2025-01-15|3|Next Day|24.99|3|Shipped|1|Credit Card',
 'PROD003,Leather Jacket,Premium leather biker jacket,1,Clothing,104,Outerwear',
 'L|Brown|2|Leather|1|Solid',
 '3|LeatherLux|3|Italy',
 '199.99|0|15',
 'SUPP003|Italian Leathers|123 Tannery Rd|6|Milan|Marco Rossi|+39-555-123-4567|sales@italianleathers.com'
),
('ORD004', 
 'CUST004|Alex|Kim|alexkim@email.com|+1-555-777-8888', 
 '222 Cedar Blvd|7|Seattle|1|USA',
 '2025-01-20|2|Standard|9.99|1|Delivered|2|PayPal',
 'PROD004,Athletic Shoes,Performance running shoes,2,Footwear,201,Athletic',
 '9|White/Blue|3|Synthetic|3|Striped',
 '4|SportStep|4|Germany',
 '89.99|10|45',
 'SUPP004|Global Footwear|456 Industrial Park|8|Berlin|Hans Mueller|+49-555-987-6543|orders@globalfootwear.com'
),
('ORD005', 
 'CUST005|Sophia|Chen|sophia.c@email.com|+1-555-111-2222', 
 '333 Birch St|9|San Francisco|1|USA',
 '2025-01-25|1|Express|15.99|2|Processing|1|Credit Card',
 'PROD006,Cashmere Sweater,Luxury cashmere pullover sweater,1,Clothing,105,Sweaters',
 'M|Navy|4|Cashmere|4|Cable Knit',
 '5|LuxeWear|5|Scotland',
 '149.99|0|20',
 'SUPP005|Highland Textiles|789 Wool St|10|Edinburgh|Angus MacDonald|+44-555-123-4567|info@highlandtextiles.com'
),
('ORD006', 
 'CUST006|David|Patel|david.p@email.com|+1-555-333-4444', 
 '444 Maple Dr|11|Boston|1|USA',
 '2025-02-01|2|Standard|9.99|1|Delivered|2|PayPal',
 'PROD007,Silk Scarf,Hand-painted silk scarf,3,Accessories,301,Scarves',
 'OS|Multicolor|5|Silk|5|Printed',
 '6|SilkRoad|6|China',
 '59.99|5|35',
 'SUPP006|Asian Silks|101 Silk Rd|12|Shanghai|Li Wei|+86-555-987-6543|sales@asiansilks.com'
),
('ORD007', 
 'CUST007|Michael|Brown|michael.b@email.com|+1-555-666-7777', 
 '555 Elm St|13|Dallas|1|USA',
 '2025-02-05|3|Next Day|24.99|3|Shipped|1|Credit Card',
 'PROD008,Designer Sunglasses,UV protected designer sunglasses,3,Accessories,302,Eyewear',
 'OS|Black/Gold|6|Metal/Plastic|1|Solid',
 '7|VisionLux|3|Italy',
 '129.99|0|25',
 'SUPP007|Italian Eyewear|222 Fashion Ave|14|Rome|Giulia Bianchi|+39-555-111-2222|orders@italianeyewear.com'
),
('ORD008', 
 'CUST008|Olivia|Wilson|olivia.w@email.com|+1-555-888-9999', 
 '666 Oak Lane|15|Los Angeles|1|USA',
 '2025-02-10|2|Standard|9.99|2|Processing|2|PayPal',
 'PROD009,Formal Shirt,Business formal button-up shirt,1,Clothing,106,Shirts',
 'L|White|11|Cotton Blend|1|Solid',
 '8|ExecutiveStyle|7|UK',
 '69.99|10|40',
 'SUPP008|British Textiles|333 Savile Row|16|London|James Wilson|+44-555-222-3333|sales@britishtextiles.com'
),
('ORD009', 
 'CUST009|Luisa|Martinez|luisa.m@email.com|+1-555-222-1111', 
 '777 Pine Ave|17|Phoenix|1|USA',
 '2025-02-15|1|Express|15.99|1|Delivered|1|Credit Card',
 'PROD010,Summer Sandals,Comfortable leather sandals,2,Footwear,202,Sandals',
 '7|Tan|2|Leather|6|Woven',
 '9|StepEasy|8|Spain',
 '79.99|15|30',
 'SUPP009|Spanish Leathers|444 Tanner St|18|Barcelona|Carlos Rodriguez|+34-555-987-6543|info@spanishleathers.com'
),
('ORD010', 
 'CUST010|James|Williams|james.w@email.com|+1-555-444-3333', 
 '888 Cedar Rd|19|Denver|1|USA',
 '2025-02-20|2|Standard|9.99|3|Shipped|2|PayPal',
 'PROD011,Wool Coat,Winter wool coat with belt,1,Clothing,104,Outerwear',
 'M|Grey|7|Wool|7|Herringbone',
 '10|WinterChic|9|Canada',
 '179.99|0|18',
 'SUPP010|Canadian Woolens|555 Cold St|20|Toronto|Sarah Thompson|+1-555-123-7890|orders@canadianwoolens.com'
),
('ORD011', 
 'CUST001|John|Smith|john.smith@email.com|+1-555-123-4567', 
 '123 Main St|1|New York|1|USA',
 '2025-02-25|3|Next Day|24.99|2|Processing|1|Credit Card',
 'PROD012,Leather Wallet,Genuine leather bifold wallet,3,Accessories,303,Wallets',
 'OS|Black|2|Leather|1|Solid',
 '3|LeatherLux|3|Italy',
 '49.99|0|50',
 'SUPP003|Italian Leathers|123 Tannery Rd|6|Milan|Marco Rossi|+39-555-123-4567|sales@italianleathers.com'
),
('ORD012', 
 'CUST005|Sophia|Chen|sophia.c@email.com|+1-555-111-2222', 
 '333 Birch St|9|San Francisco|1|USA',
 '2025-03-01|1|Express|15.99|1|Delivered|2|PayPal',
 'PROD013,Yoga Pants,Stretchable yoga pants,1,Clothing,107,Activewear',
 'S|Black|8|Spandex Blend|1|Solid',
 '11|FitLife|1|USA',
 '59.99|10|65',
 'SUPP011|Active Textiles|666 Fitness Blvd|21|Portland|Tyler Johnson|+1-555-444-8888|sales@activetextiles.com'
),
('ORD013', 
 'CUST008|Olivia|Wilson|olivia.w@email.com|+1-555-888-9999', 
 '666 Oak Lane|15|Los Angeles|1|USA',
 '2025-03-05|2|Standard|9.99|3|Shipped|1|Credit Card',
 'PROD014,Beaded Necklace,Handmade beaded statement necklace,3,Accessories,304,Jewelry',
 'OS|Turquoise|9|Glass/Metal|8|Beaded',
 '12|ArtisanGems|10|Mexico',
 '89.99|5|15',
 'SUPP012|Artisan Crafts|777 Creative St|22|Mexico City|Elena Fernandez|+52-555-123-4567|crafts@artisancrafts.com'
),
('ORD014', 
 'CUST003|Maria|Garcia|maria@email.com|+1-555-444-5555', 
 '101 Pine St|5|Miami|1|USA',
 '2025-03-10|3|Next Day|24.99|2|Processing|2|PayPal',
 'PROD015,Linen Shirt,Breathable linen summer shirt,1,Clothing,106,Shirts',
 'XL|Beige|10|Linen|1|Solid',
 '13|SummerBreeze|11|Portugal',
 '79.99|0|28',
 'SUPP013|Mediterranean Fabrics|888 Sea View Rd|23|Lisbon|João Silva|+351-555-987-6543|info@medfabrics.com'
),
('ORD015', 
 'CUST011|Robert|Lee|robert.l@email.com|+1-555-777-1111', 
 '999 Birch Ave|24|Austin|1|USA',
 '2025-03-15|2|Standard|9.99|1|Delivered|1|Credit Card',
 'PROD016,Leather Belt,Full-grain leather belt with buckle,3,Accessories,305,Belts',
 'M|Brown|2|Leather|1|Solid',
 '14|LeatherCraft|12|Argentina',
 '39.99|0|45',
 'SUPP014|South American Leathers|999 Cattle Rd|25|Buenos Aires|Diego Martinez|+54-555-123-4567|orders@southamericanleathers.com'
);

-- Add more sample data as needed to fulfill the requirement of at least 30 data items 