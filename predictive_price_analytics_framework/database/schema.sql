-- =========================================================================
-- A Predictive Analytics Framework for Multi-Platform Price Prediction
-- Final Year College Project Database Schema (MySQL)
-- =========================================================================

CREATE DATABASE IF NOT EXISTS smartprice_db;
USE smartprice_db;

-- 1. Users Table
DROP TABLE IF EXISTS price_alerts;
DROP TABLE IF EXISTS price_history;
DROP TABLE IF EXISTS platform_prices;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Products Master Table
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    current_lowest_price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(3, 1) DEFAULT 4.5,
    review_count INT DEFAULT 0,
    description TEXT,
    best_platform VARCHAR(50) NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_brand (brand)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Multi-Platform Real-Time Prices Table
CREATE TABLE platform_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    platform_name VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(3, 1) DEFAULT 4.5,
    in_stock BOOLEAN DEFAULT TRUE,
    delivery_days INT DEFAULT 2,
    seller_name VARCHAR(100),
    product_url VARCHAR(255),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_prod_platform (product_id, platform_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Historical Daily Prices Table (For Time-Series ML Analysis)
CREATE TABLE price_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    day_offset INT NOT NULL, -- e.g. -60 to 0 (today)
    date_str VARCHAR(20) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    platform_name VARCHAR(50),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_hist_prod (product_id, day_offset)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. User Price Drop Alerts Table
CREATE TABLE price_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    target_price DECIMAL(10, 2) NOT NULL,
    current_price DECIMAL(10, 2) NOT NULL,
    is_triggered BOOLEAN DEFAULT FALSE,
    note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
-- Seed Data Initialization
-- =========================================================================

-- Insert Demo Users (password hash for 'demo123')
INSERT INTO users (full_name, email, password_hash, role) VALUES 
('Alex Hunter', 'student@smartprice.edu', 'pbkdf2:sha256:600000$demo$hash', 'student'),
('Test User', 'demo@test.com', 'pbkdf2:sha256:600000$demo$hash', 'user');

-- Insert Initial Products
INSERT INTO products (id, title, category, brand, current_lowest_price, original_price, rating, review_count, description, best_platform, image_url) VALUES 
('prod_001', 'Apple iPhone 15 Pro (128GB, Natural Titanium)', 'Smartphones', 'Apple', 899.99, 999.00, 4.8, 14200, 'Titanium design with A17 Pro chip, Action button, and 48MP camera system.', 'Best Buy', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600'),
('prod_002', 'Samsung Galaxy S24 Ultra 5G (256GB, Titanium Gray)', 'Smartphones', 'Samsung', 1149.00, 1299.99, 4.7, 9850, 'Galaxy AI powerhouse with built-in S Pen and Snapdragon 8 Gen 3.', 'Amazon', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600'),
('prod_003', 'Apple MacBook Air 13-inch (M3 chip, 8-Core CPU, 16GB)', 'Laptops', 'Apple', 1049.00, 1199.00, 4.9, 8120, 'Strikingly thin design with up to 18 hours of battery life and Liquid Retina display.', 'Walmart', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'),
('prod_004', 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones', 'Audio', 'Sony', 328.00, 399.99, 4.8, 22400, 'Industry-leading noise cancellation with 8 microphones and 30hr battery.', 'Amazon', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'),
('prod_005', 'Dell XPS 15 9530 Laptop (13th Gen Intel i7, 32GB, RTX 4060)', 'Laptops', 'Dell', 1699.99, 1999.00, 4.6, 3400, 'High-performance creator laptop with 3.5K OLED InfinityEdge display.', 'Best Buy', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600'),
('prod_006', 'Apple Watch Series 9 (GPS 45mm, Starlight Aluminum)', 'Wearables', 'Apple', 359.00, 429.00, 4.8, 11800, 'S9 SiP chip with Double Tap gesture, brighter always-on display, and ECG.', 'Flipkart', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'),
('prod_007', 'Sony PlayStation 5 Slim Digital Edition (1TB SSD)', 'Gaming', 'Sony', 399.99, 449.99, 4.9, 31200, 'Slim form factor with 1TB SSD storage, Ray Tracing, and Tempest 3D AudioTech.', 'Walmart', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600'),
('prod_008', 'Google Pixel 9 Pro 5G (128GB, Obsidian)', 'Smartphones', 'Google', 949.00, 999.00, 4.7, 5120, 'Engineered by Google with Tensor G4 processor and Gemini Advanced integration.', 'Amazon', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600');

-- Insert Multi-Platform Prices for iPhone 15 Pro
INSERT INTO platform_prices (product_id, platform_name, price, original_price, rating, in_stock, delivery_days, seller_name, product_url) VALUES 
('prod_001', 'Best Buy', 899.99, 999.00, 4.9, 1, 2, 'Official Best Buy Store', 'https://www.bestbuy.com/site/apple-iphone-15-pro'),
('prod_001', 'Amazon', 919.00, 999.00, 4.8, 1, 1, 'Apple Store at Amazon', 'https://www.amazon.com/dp/B0CHX1'),
('prod_001', 'Walmart', 929.99, 999.00, 4.6, 1, 3, 'Walmart Direct', 'https://www.walmart.com/ip/iPhone-15-Pro'),
('prod_001', 'Flipkart', 935.00, 999.00, 4.7, 1, 3, 'SuperComNet', 'https://www.flipkart.com/apple-iphone-15-pro'),
('prod_001', 'eBay', 945.00, 999.00, 4.5, 1, 4, 'TopRatedSeller-Tech', 'https://www.ebay.com/itm/iPhone-15-Pro');

-- Insert Multi-Platform Prices for Sony WH-1000XM5
INSERT INTO platform_prices (product_id, platform_name, price, original_price, rating, in_stock, delivery_days, seller_name, product_url) VALUES 
('prod_004', 'Amazon', 328.00, 399.99, 4.9, 1, 1, 'Sony Authorized Direct', 'https://www.amazon.com/dp/B09XS7'),
('prod_004', 'Best Buy', 349.99, 399.99, 4.8, 1, 2, 'Best Buy Tech', 'https://www.bestbuy.com/site/sony-wh1000xm5'),
('prod_004', 'Walmart', 348.00, 399.99, 4.7, 1, 2, 'Walmart Online', 'https://www.walmart.com/ip/Sony-Headphones'),
('prod_004', 'Flipkart', 359.00, 399.99, 4.6, 1, 4, 'RetailNet', 'https://www.flipkart.com/sony-wh-1000xm5'),
('prod_004', 'eBay', 339.00, 399.99, 4.5, 1, 3, 'ProElectronicsUSA', 'https://www.ebay.com/itm/Sony-WH1000XM5');

-- Sample Initial Alert
INSERT INTO price_alerts (user_id, product_id, target_price, current_price, is_triggered, note) VALUES 
(1, 'prod_001', 850.00, 899.99, 0, 'Target: 5% drop below current lowest price');
