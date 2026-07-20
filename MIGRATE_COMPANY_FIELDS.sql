-- Migration Script: Add New Company Fields
-- Run this script to update existing databases with new company fields

USE deals_db;

-- Add new columns to companies table if they don't exist
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_opt_out BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone2 VARCHAR(20);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS fax VARCHAR(20);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS reviews VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS owner VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS tags VARCHAR(500);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS source VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'English';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS description TEXT;

-- Add index on source column if not exists (creates automatically on index add)
ALTER TABLE companies ADD INDEX IF NOT EXISTS idx_source (source);

-- Verify all columns exist
DESCRIBE companies;

-- Check that all columns were added successfully
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'deals_db' AND TABLE_NAME = 'companies' 
ORDER BY ORDINAL_POSITION;
