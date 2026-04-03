CREATE DATABASE stationery_db;
USE stationery_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL -- 'STUDENT' or 'MANAGER'
);

-- Insert a test user
INSERT INTO users (full_name, email, password, role) 
VALUES ('Test User', 'admin@test.com', 'password123', 'STUDENT');
USE stationery_db;

CREATE TABLE IF NOT EXISTS users1(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL -- 'STUDENT' or 'MANAGER'
);
USE stationery_db;

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price DOUBLE NOT NULL,
    quantity INT DEFAULT 0,
    discount INT DEFAULT 0,
    image_url VARCHAR(255)
);
truncate products;



-- 2. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    total_price DOUBLE,
    status VARCHAR(50) DEFAULT 'PENDING',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


-- 3. Print Requests Table
CREATE TABLE IF NOT EXISTS print_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    doc_name VARCHAR(255),
    pages INT,
    print_type VARCHAR(50),
    copies INT,
    status VARCHAR(50) DEFAULT 'PENDING',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert sample products
USE stationery_db;

-- 1. Insert Products (So they show up in 'View Stationary')
INSERT INTO products (name, price, quantity, discount, image_url) VALUES 
('Premium Spiral Notebook', 150.0, 45, 10, 'notebook.jpeg'),
('Set of 5 Gel Pens', 50.0, 120, 0, 'pens.jpeg'),
('Mathematics Geometry Box', 120.0, 15, 5, 'geometrybox.jpeg'),
('Colorful Sticky Notes', 40.0, 60, 5, 'stickynotes.jpeg');

-- 2. Check if they are there
SELECT * FROM products;
truncate products;

USE stationery_db;
SELECT * FROM users;
SELECT * FROM products;
SELECT * FROM orders;
SELECT * FROM print_requests;
TRUNCATE TABLE orders;
USE stationery_db;
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    price DOUBLE,
    quantity INT,
    user_id BIGINT
);

select * from cart_items;



