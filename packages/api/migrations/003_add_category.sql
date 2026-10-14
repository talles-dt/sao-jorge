-- ☩ Migration 003: Add missing columns to service_catalog
-- D1-friendly: only adds columns and sets default for existing rows

-- The v2 baseline in 001_schema.sql already contains both columns. This
-- migration is retained as a compatibility checkpoint for installations that
-- recorded 003 in their history; replaying ALTER TABLE here would fail on a
-- clean v2 database with "duplicate column name".
SELECT 1;
