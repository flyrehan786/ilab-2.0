-- Reset Admin Password SQL Script
-- Password: admin123
-- This script will reset the admin user password

USE lab_management;

-- Delete existing admin user if exists
DELETE FROM users WHERE username = 'admin';

-- Insert admin user with correct password hash
-- Password: admin123 (bcrypt hash)
INSERT INTO users (username, email, password, role, full_name, phone, is_active) 
VALUES (
  'admin', 
  'admin@lab.com', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'admin', 
  'System Administrator', 
  '1234567890',
  TRUE
);

-- Verify the user was created
SELECT id, username, email, role, full_name FROM users WHERE username = 'admin';

-- Show success message
SELECT 'Admin user created successfully! Username: admin, Password: admin123' AS message;
