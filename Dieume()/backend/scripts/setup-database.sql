-- SIMS Database Setup Script
-- This script creates the database and sets up basic configuration

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS sims;

-- Use the database
USE sims;

-- Create a user for the application (optional, for production)
-- CREATE USER IF NOT EXISTS 'sims_user'@'localhost' IDENTIFIED BY 'sims_password';
-- GRANT ALL PRIVILEGES ON sims.* TO 'sims_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Note: Tables will be created automatically by Sequelize when the server starts
-- The following is just for reference of the expected schema:

/*
Expected Tables (created by Sequelize):

1. users
   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
   - username (VARCHAR(50), UNIQUE, NOT NULL)
   - password (VARCHAR(255), NOT NULL)
   - createdAt (DATETIME)
   - updatedAt (DATETIME)

2. spare_parts
   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
   - name (VARCHAR(100), NOT NULL)
   - category (VARCHAR(50), NOT NULL)
   - quantity (INT, DEFAULT 0)
   - unit_price (DECIMAL(10,2), NOT NULL)
   - total_price (DECIMAL(10,2), NOT NULL)
   - createdAt (DATETIME)
   - updatedAt (DATETIME)

3. stock_in
   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
   - spare_part_id (INT, FOREIGN KEY)
   - quantity (INT, NOT NULL)
   - stock_in_date (DATE, NOT NULL)
   - createdAt (DATETIME)
   - updatedAt (DATETIME)

4. stock_out
   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
   - spare_part_id (INT, FOREIGN KEY)
   - quantity (INT, NOT NULL)
   - unit_price (DECIMAL(10,2), NOT NULL)
   - total_price (DECIMAL(10,2), NOT NULL)
   - stock_out_date (DATE, NOT NULL)
   - createdAt (DATETIME)
   - updatedAt (DATETIME)
*/

-- Insert sample data (will be done by the application)
-- Default admin user: username=admin, password=admin123 (hashed)

SELECT 'Database setup completed. Start the Node.js server to create tables and default user.' as message;
