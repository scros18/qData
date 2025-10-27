-- Run this SQL script to create the database and user for qData
-- Command: sudo mysql -u root -p < setup-database.sql

-- Create database
CREATE DATABASE IF NOT EXISTS qdata CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (change the password!)
CREATE USER IF NOT EXISTS 'qdata_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON qdata.* TO 'qdata_user'@'localhost';

-- Grant SELECT on information_schema for database browsing
GRANT SELECT ON `information_schema`.* TO 'qdata_user'@'localhost';

-- Grant SHOW DATABASES privilege
GRANT SHOW DATABASES ON *.* TO 'qdata_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Show success message
SELECT 'Database and user created successfully!' AS status;
SELECT 'User: qdata_user' AS info;
SELECT 'Database: qdata' AS info;
SELECT 'Remember to update the password in .env.production!' AS reminder;
