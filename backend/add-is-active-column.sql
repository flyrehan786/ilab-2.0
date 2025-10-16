-- Add is_active column to users table
-- This migration adds the missing is_active column

USE lab_management;

-- Check if column exists, if not add it
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE AFTER phone;

-- Update existing users to be active
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;

-- Verify the column was added
DESCRIBE users;

SELECT 'is_active column added successfully!' AS message;
