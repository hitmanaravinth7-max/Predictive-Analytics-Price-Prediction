"""
Database connector module supporting MySQL with automatic SQLite fallback.
Provides unified query execution and transaction handling for the Flask app.
"""

import os
import sqlite3
import pymysql
from pymysql.cursors import DictCursor

DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_USER = os.environ.get("DB_USER", "root")
DB_PASS = os.environ.get("DB_PASS", "")
DB_NAME = os.environ.get("DB_NAME", "smartprice_db")
SQLITE_PATH = os.path.join(os.path.dirname(__file__), "smartprice_local.db")

_USE_SQLITE = False

def get_connection():
    global _USE_SQLITE
    if _USE_SQLITE:
        conn = sqlite3.connect(SQLITE_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    try:
        conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME,
            cursorclass=DictCursor,
            autocommit=True
        )
        return conn
    except Exception as e:
        # Fallback gracefully to SQLite if MySQL server is not locally running
        _USE_SQLITE = True
        init_sqlite_if_needed()
        conn = sqlite3.connect(SQLITE_PATH)
        conn.row_factory = sqlite3.Row
        return conn

def execute_query(query, params=(), fetchone=False, fetchall=False):
    conn = get_connection()
    try:
        if _USE_SQLITE:
            # Convert MySQL %s placeholders to SQLite ? placeholders
            sqlite_query = query.replace("%s", "?")
            cur = conn.cursor()
            cur.execute(sqlite_query, params)
            if fetchone:
                row = cur.fetchone()
                return dict(row) if row else None
            if fetchall:
                rows = cur.fetchall()
                return [dict(r) for r in rows]
            conn.commit()
            return cur.lastrowid
        else:
            with conn.cursor() as cur:
                cur.execute(query, params)
                if fetchone:
                    return cur.fetchone()
                if fetchall:
                    return cur.fetchall()
                return cur.lastrowid
    finally:
        conn.close()

def init_sqlite_if_needed():
    if not os.path.exists(SQLITE_PATH):
        conn = sqlite3.connect(SQLITE_PATH)
        cur = conn.cursor()
        cur.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            brand TEXT NOT NULL,
            current_lowest_price REAL NOT NULL,
            original_price REAL NOT NULL,
            rating REAL DEFAULT 4.5,
            review_count INTEGER DEFAULT 0,
            description TEXT,
            best_platform TEXT NOT NULL,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS platform_prices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id TEXT NOT NULL,
            platform_name TEXT NOT NULL,
            price REAL NOT NULL,
            original_price REAL NOT NULL,
            rating REAL DEFAULT 4.5,
            in_stock INTEGER DEFAULT 1,
            delivery_days INTEGER DEFAULT 2,
            seller_name TEXT,
            product_url TEXT,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id)
        );
        CREATE TABLE IF NOT EXISTS price_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id TEXT NOT NULL,
            day_offset INTEGER NOT NULL,
            date_str TEXT NOT NULL,
            price REAL NOT NULL,
            platform_name TEXT,
            FOREIGN KEY (product_id) REFERENCES products(id)
        );
        CREATE TABLE IF NOT EXISTS price_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id TEXT NOT NULL,
            target_price REAL NOT NULL,
            current_price REAL NOT NULL,
            is_triggered INTEGER DEFAULT 0,
            note TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        );
        """)
        # Seed users & products
        cur.executescript("""
        INSERT OR IGNORE INTO users (id, full_name, email, password_hash, role) VALUES 
        (1, 'Alex Hunter', 'student@smartprice.edu', 'pbkdf2:sha256:600000$demo$hash', 'student');

        INSERT OR IGNORE INTO products (id, title, category, brand, current_lowest_price, original_price, rating, review_count, description, best_platform, image_url) VALUES 
        ('prod_001', 'Apple iPhone 15 Pro (128GB, Natural Titanium)', 'Smartphones', 'Apple', 899.99, 999.00, 4.8, 14200, 'Titanium design with A17 Pro chip and 48MP camera.', 'Best Buy', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600'),
        ('prod_002', 'Samsung Galaxy S24 Ultra 5G (256GB, Titanium Gray)', 'Smartphones', 'Samsung', 1149.00, 1299.99, 4.7, 9850, 'Galaxy AI powerhouse with built-in S Pen and Snapdragon 8 Gen 3.', 'Amazon', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600'),
        ('prod_003', 'Apple MacBook Air 13-inch (M3 chip, 8-Core CPU, 16GB)', 'Laptops', 'Apple', 1049.00, 1199.00, 4.9, 8120, 'Strikingly thin design with up to 18 hours battery life.', 'Walmart', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'),
        ('prod_004', 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones', 'Audio', 'Sony', 328.00, 399.99, 4.8, 22400, 'Industry-leading noise cancellation with 8 microphones.', 'Amazon', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'),
        ('prod_005', 'Dell XPS 15 9530 Laptop (13th Gen Intel i7, 32GB, RTX 4060)', 'Laptops', 'Dell', 1699.99, 1999.00, 4.6, 3400, 'High-performance creator laptop with 3.5K OLED display.', 'Best Buy', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600'),
        ('prod_006', 'Apple Watch Series 9 (GPS 45mm, Starlight Aluminum)', 'Wearables', 'Apple', 359.00, 429.00, 4.8, 11800, 'S9 SiP chip with Double Tap gesture and ECG sensor.', 'Flipkart', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'),
        ('prod_007', 'Sony PlayStation 5 Slim Digital Edition (1TB SSD)', 'Gaming', 'Sony', 399.99, 449.99, 4.9, 31200, 'Slim form factor with 1TB SSD storage and Tempest 3D Audio.', 'Walmart', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600'),
        ('prod_008', 'Google Pixel 9 Pro 5G (128GB, Obsidian)', 'Smartphones', 'Google', 949.00, 999.00, 4.7, 5120, 'Engineered by Google with Tensor G4 and Gemini Advanced.', 'Amazon', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600');

        INSERT OR IGNORE INTO platform_prices (product_id, platform_name, price, original_price, rating, in_stock, delivery_days, seller_name, product_url) VALUES
        ('prod_001', 'Best Buy', 899.99, 999.00, 4.9, 1, 2, 'Official Best Buy Store', 'https://www.bestbuy.com/site/apple-iphone-15-pro'),
        ('prod_001', 'Amazon', 919.00, 999.00, 4.8, 1, 1, 'Apple Store at Amazon', 'https://www.amazon.com/dp/B0CHX1'),
        ('prod_001', 'Walmart', 929.99, 999.00, 4.6, 1, 3, 'Walmart Direct', 'https://www.walmart.com/ip/iPhone-15-Pro'),
        ('prod_001', 'Flipkart', 935.00, 999.00, 4.7, 1, 3, 'SuperComNet', 'https://www.flipkart.com/apple-iphone-15-pro'),
        ('prod_001', 'eBay', 945.00, 999.00, 4.5, 1, 4, 'TopRatedSeller-Tech', 'https://www.ebay.com/itm/iPhone-15-Pro');

        INSERT OR IGNORE INTO price_alerts (id, user_id, product_id, target_price, current_price, is_triggered, note) VALUES 
        (1, 1, 'prod_001', 850.00, 899.99, 0, 'Target: 5% drop below current lowest price');
        """)
        conn.commit()
        conn.close()
