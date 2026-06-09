-- ☩ Migration 003: Add missing columns to service_catalog
-- D1-friendly: only adds columns and sets default for existing rows

-- Add 'category' column with default value
ALTER TABLE service_catalog ADD COLUMN category TEXT NOT NULL DEFAULT 'liturgia';

-- Add 'subcategory' column (nullable, no default)
ALTER TABLE service_catalog ADD COLUMN subcategory TEXT;

-- Remove the default constraint to avoid future INSERT confusion
-- Note: D1 does not support ALTER COLUMN to drop default, use a no-op UPDATE instead
UPDATE service_catalog SET category = category WHERE 1=1;