-- Kategori verileri ekleme
-- Ana kategoriler (level 0)
INSERT INTO categories (name, description, parent_id, level, active) VALUES 
('Elektronik', 'Elektronik ürünler ve teknolojik cihazlar', NULL, 0, true),
('Giyim', 'Moda ve tekstil ürünleri', NULL, 0, true),
('Ev & Yaşam', 'Ev dekorasyon ve yaşam ürünleri', NULL, 0, true),
('Spor & Outdoor', 'Spor malzemeleri ve outdoor ekipmanlar', NULL, 0, true),
('Kitap & Hobi', 'Kitaplar, müzik, film ve hobi ürünleri', NULL, 0, true);

-- Elektronik alt kategorileri (level 1)
INSERT INTO categories (name, description, parent_id, level, active) VALUES 
('Bilgisayar', 'Masaüstü, laptop ve bilgisayar ekipmanları', 1, 1, true),
('Telefon', 'Akıllı telefonlar ve aksesuarlar', 1, 1, true),
('TV & Ses Sistemleri', 'Televizyonlar ve ses sistemleri', 1, 1, true),
('Fotoğraf & Kamera', 'Fotoğraf makineleri ve ekipmanları', 1, 1, true);

-- Giyim alt kategorileri (level 1)
INSERT INTO categories (name, description, parent_id, level, active) VALUES 
('Kadın Giyim', 'Kadın moda ve giyim ürünleri', 2, 1, true),
('Erkek Giyim', 'Erkek moda ve giyim ürünleri', 2, 1, true),
('Çocuk Giyim', 'Çocuk moda ve giyim ürünleri', 2, 1, true),
('Ayakkabı & Çanta', 'Ayakkabı ve çanta koleksiyonu', 2, 1, true);

-- Ev & Yaşam alt kategorileri (level 1)
INSERT INTO categories (name, description, parent_id, level, active) VALUES 
('Mobilya', 'Ev ve ofis mobilyaları', 3, 1, true),
('Mutfak Gereçleri', 'Mutfak eşyaları ve pişirme ekipmanları', 3, 1, true),
('Dekorasyon', 'Ev dekorasyon ürünleri', 3, 1, true),
('Elektrikli Ev Aletleri', 'Beyaz eşya ve elektrikli ev aletleri', 3, 1, true);

-- Bilgisayar alt kategorileri (level 2)
INSERT INTO categories (name, description, parent_id, level, active) VALUES 
('Laptop', 'Taşınabilir bilgisayarlar', 6, 2, true),
('Masaüstü Bilgisayar', 'Masaüstü bilgisayar sistemleri', 6, 2, true),
('Bilgisayar Bileşenleri', 'Bilgisayar yedek parça ve bileşenleri', 6, 2, true),
('Monitörler', 'Bilgisayar monitörleri', 6, 2, true);

-- Telefon alt kategorileri (level 2)
INSERT INTO categories (name, description, parent_id, level, active) VALUES 
('Akıllı Telefonlar', 'Akıllı telefon modelleri', 7, 2, true),
('Telefon Kılıfları', 'Koruyucu kılıf ve kapaklar', 7, 2, true),
('Şarj Cihazları', 'Telefon şarj cihazları ve powerbank', 7, 2, true),
('Ekran Koruyucular', 'Cam ve film ekran koruyucular', 7, 2, true);

-- Ürün verileri (Elektronik / Bilgisayar / Laptop)
INSERT INTO products (name, description, price, stock, image_url, category_id, active, featured, slug, min_price, created_at, updated_at) VALUES 
('MacBook Pro M2', '13 inç MacBook Pro, Apple M2 çip, 8GB RAM, 256GB SSD', 34999.99, 25, 'https://example.com/images/macbook-pro.jpg', 17, true, true, 'macbook-pro-m2', 34999.99, NOW(), NOW()),
('Lenovo ThinkPad X1', '14 inç ThinkPad X1 Carbon, Intel i7, 16GB RAM, 512GB SSD', 29999.99, 15, 'https://example.com/images/thinkpad-x1.jpg', 17, true, false, 'lenovo-thinkpad-x1', 29999.99, NOW(), NOW()),
('ASUS ROG Zephyrus', '15.6 inç Oyun Laptopu, RTX 3070, AMD Ryzen 9, 32GB RAM', 42999.99, 10, 'https://example.com/images/asus-rog.jpg', 17, true, true, 'asus-rog-zephyrus', 42999.99, NOW(), NOW()),
('HP Spectre x360', '13.5 inç 2-in-1 Laptop, Intel i7, 16GB RAM, 1TB SSD', 32999.99, 20, 'https://example.com/images/hp-spectre.jpg', 17, true, false, 'hp-spectre-x360', 32999.99, NOW(), NOW()),
('Dell XPS 13', '13 inç Ultra-İnce Laptop, Intel i5, 8GB RAM, 512GB SSD', 24999.99, 30, 'https://example.com/images/dell-xps.jpg', 17, true, true, 'dell-xps-13', 24999.99, NOW(), NOW());

-- Ürün verileri (Elektronik / Telefon / Akıllı Telefonlar)
INSERT INTO products (name, description, price, stock, image_url, category_id, active, featured, slug, min_price, created_at, updated_at) VALUES 
('iPhone 15 Pro', 'Apple iPhone 15 Pro, 256GB, Titanium Siyah', 54999.99, 20, 'https://example.com/images/iphone-15.jpg', 21, true, true, 'iphone-15-pro', 54999.99, NOW(), NOW()),
('Samsung Galaxy S23', 'Samsung Galaxy S23 Ultra, 512GB, 200MP Kamera', 44999.99, 25, 'https://example.com/images/samsung-s23.jpg', 21, true, true, 'samsung-galaxy-s23', 44999.99, NOW(), NOW()),
('Google Pixel 8', 'Google Pixel 8 Pro, 128GB, Yapay Zeka Özellikleri', 34999.99, 15, 'https://example.com/images/pixel-8.jpg', 21, true, false, 'google-pixel-8', 34999.99, NOW(), NOW()),
('Xiaomi 13T', 'Xiaomi 13T Pro, 256GB, 108MP Kamera, 120W Hızlı Şarj', 24999.99, 30, 'https://example.com/images/xiaomi-13t.jpg', 21, true, false, 'xiaomi-13t', 24999.99, NOW(), NOW()),
('Nothing Phone 2', 'Nothing Phone 2, 256GB, Yenilikçi Glyph Arayüzü', 29999.99, 10, 'https://example.com/images/nothing-phone.jpg', 21, true, true, 'nothing-phone-2', 29999.99, NOW(), NOW());

-- Ürün verileri (Giyim / Erkek Giyim)
INSERT INTO products (name, description, price, stock, image_url, category_id, active, featured, slug, min_price, created_at, updated_at) VALUES 
('Slim Fit Pamuklu Gömlek', 'Erkek slim fit pamuklu uzun kollu gömlek', 699.99, 50, 'https://example.com/images/cotton-shirt.jpg', 10, true, false, 'slim-fit-pamuklu-gomlek', 699.99, NOW(), NOW()),
('Premium Deri Ceket', 'Erkek hakiki deri ceket, siyah', 3999.99, 15, 'https://example.com/images/leather-jacket.jpg', 10, true, true, 'premium-deri-ceket', 3999.99, NOW(), NOW()),
('Keten Pantolon', 'Erkek rahat kesim keten pantolon', 899.99, 30, 'https://example.com/images/linen-pants.jpg', 10, true, false, 'keten-pantolon', 899.99, NOW(), NOW()),
('Yün Karışımlı Kazak', 'Erkek boğazlı yün karışımlı kazak', 1299.99, 25, 'https://example.com/images/wool-sweater.jpg', 10, true, true, 'yun-karisimli-kazak', 1299.99, NOW(), NOW()),
('Spor Eşofman Takımı', 'Erkek spor eşofman takımı, gri', 1599.99, 40, 'https://example.com/images/tracksuit.jpg', 10, true, false, 'spor-esofman-takimi', 1599.99, NOW(), NOW());

-- Ürün verileri (Giyim / Kadın Giyim)
INSERT INTO products (name, description, price, stock, image_url, category_id, active, featured, slug, min_price, created_at, updated_at) VALUES 
('Şifon Bluz', 'Kadın şifon bluz, çiçek desenli', 899.99, 35, 'https://example.com/images/chiffon-blouse.jpg', 9, true, true, 'sifon-bluz', 899.99, NOW(), NOW()),
('Deri Etek', 'Kadın deri mini etek, siyah', 1499.99, 20, 'https://example.com/images/leather-skirt.jpg', 9, true, false, 'deri-etek', 1499.99, NOW(), NOW()),
('Keten Blazer Ceket', 'Kadın oversize keten blazer ceket', 1899.99, 25, 'https://example.com/images/linen-blazer.jpg', 9, true, true, 'keten-blazer-ceket', 1899.99, NOW(), NOW()),
('Yüksek Bel Jean', 'Kadın yüksek bel straight jean', 1299.99, 40, 'https://example.com/images/high-waist-jeans.jpg', 9, true, false, 'yuksek-bel-jean', 1299.99, NOW(), NOW()),
('Triko Elbise', 'Kadın triko midi elbise, bej', 1699.99, 30, 'https://example.com/images/knit-dress.jpg', 9, true, true, 'triko-elbise', 1699.99, NOW(), NOW());

-- Ürün verileri (Ev & Yaşam / Mobilya)
INSERT INTO products (name, description, price, stock, image_url, category_id, active, featured, slug, min_price, created_at, updated_at) VALUES 
('Modern Koltuk Takımı', '3+2+1 modern koltuk takımı, gri', 24999.99, 5, 'https://example.com/images/sofa-set.jpg', 13, true, true, 'modern-koltuk-takimi', 24999.99, NOW(), NOW()),
('Ahşap Yemek Masası', '6 kişilik ahşap yemek masası seti', 12999.99, 8, 'https://example.com/images/dining-table.jpg', 13, true, false, 'ahsap-yemek-masasi', 12999.99, NOW(), NOW()),
('Çalışma Masası', 'Modern çalışma masası, çekmeceli', 3999.99, 15, 'https://example.com/images/desk.jpg', 13, true, true, 'calisma-masasi', 3999.99, NOW(), NOW()),
('Gardırop', '3 kapılı aynalı gardırop, beyaz', 8999.99, 10, 'https://example.com/images/wardrobe.jpg', 13, true, false, 'gardirop', 8999.99, NOW(), NOW()),
('TV Ünitesi', 'Modern TV ünitesi, ceviz', 5999.99, 12, 'https://example.com/images/tv-unit.jpg', 13, true, false, 'tv-unitesi', 5999.99, NOW(), NOW());

-- Ürün verileri (Ev & Yaşam / Elektrikli Ev Aletleri)
INSERT INTO products (name, description, price, stock, image_url, category_id, active, featured, slug, min_price, created_at, updated_at) VALUES 
('Buzdolabı', 'No-Frost buzdolabı, 540 litre, inox', 22999.99, 8, 'https://example.com/images/refrigerator.jpg', 16, true, true, 'buzdolabi', 22999.99, NOW(), NOW()),
('Çamaşır Makinesi', '10 kg çamaşır makinesi, A+++ enerji sınıfı', 13999.99, 10, 'https://example.com/images/washing-machine.jpg', 16, true, false, 'camasir-makinesi', 13999.99, NOW(), NOW()),
('Bulaşık Makinesi', '5 programlı bulaşık makinesi, beyaz', 11999.99, 12, 'https://example.com/images/dishwasher.jpg', 16, true, false, 'bulasik-makinesi', 11999.99, NOW(), NOW()),
('Ankastre Fırın', 'Dijital ankastre fırın, siyah cam', 9999.99, 15, 'https://example.com/images/oven.jpg', 16, true, true, 'ankastre-firin', 9999.99, NOW(), NOW()),
('Robot Süpürge', 'Akıllı robot süpürge, uzaktan kontrollü', 7999.99, 20, 'https://example.com/images/robot-vacuum.jpg', 16, true, true, 'robot-supurge', 7999.99, NOW(), NOW()); 