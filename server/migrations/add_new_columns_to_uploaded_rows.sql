-- Migration: Add new columns for updated Excel template
-- Date: 2025-12-14
-- This migration is safe to run multiple times

-- Add website column
ALTER TABLE uploaded_rows 
ADD COLUMN IF NOT EXISTS website TEXT NULL;

-- Add second competitor columns
ALTER TABLE uploaded_rows 
ADD COLUMN IF NOT EXISTS competitor_name_2 VARCHAR(255) NULL;

ALTER TABLE uploaded_rows 
ADD COLUMN IF NOT EXISTS competitor_traffic_2 INT NULL;

ALTER TABLE uploaded_rows 
ADD COLUMN IF NOT EXISTS competitor_website_2 VARCHAR(255) NULL;

-- Add competitor screenshot URL
ALTER TABLE uploaded_rows 
ADD COLUMN IF NOT EXISTS competitor_screenshot_url TEXT NULL;
