-- Migration: Create template_variables table
-- Description: Add table to support dynamic template variable management from admin panel

CREATE TABLE IF NOT EXISTS `template_variables` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `variable_name` VARCHAR(255) NOT NULL UNIQUE COMMENT 'Display name like "First Name", "Company Name"',
  `variable_key` VARCHAR(255) NOT NULL UNIQUE COMMENT 'Database/code key like "firstName", "companyName"',
  `variable_type` ENUM('text', 'image', 'link') NOT NULL DEFAULT 'text' COMMENT 'Variable type for rendering context',
  `description` TEXT NULL COMMENT 'Optional description for admin reference',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_variable_type` (`variable_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default variables from existing system
INSERT INTO template_variables (variable_name, variable_key, variable_type, description) VALUES
  ('First Name', 'firstName', 'text', 'Recipient first name'),
  ('Client Business Name', 'clientBusinessName', 'text', 'Client company name'),
  ('Company Name', 'companyName', 'text', 'Alias for client business name'),
  ('Website', 'website', 'link', 'Client website URL'),
  ('Client Website', 'clientWebsite', 'link', 'Alias for client website'),
  ('Client Traffic', 'clientTraffic', 'text', 'Client website monthly traffic'),
  ('Competitor Name', 'competitorName', 'text', 'First competitor business name'),
  ('Competitor Business Name 1', 'competitorBusinessName1', 'text', 'Alias for first competitor'),
  ('Competitor Traffic', 'competitorTraffic', 'text', 'First competitor traffic'),
  ('Competitor Traffic 1', 'competitorTraffic1', 'text', 'Alias for first competitor traffic'),
  ('Competitor Website', 'competitorWebsite', 'link', 'First competitor website URL'),
  ('Competitor Website 1', 'competitorWebsite1', 'link', 'Alias for first competitor website'),
  ('Competitor Name 2', 'competitorName2', 'text', 'Second competitor business name'),
  ('Competitor Business Name 2', 'competitorBusinessName2', 'text', 'Alias for second competitor'),
  ('Competitor Traffic 2', 'competitorTraffic2', 'text', 'Second competitor traffic'),
  ('Competitor Website 2', 'competitorWebsite2', 'link', 'Second competitor website'),
  ('Calendar Link', 'calendarLink', 'link', 'Meeting scheduler link'),
  ('Client Screenshot URL', 'clientScreenshotUrl', 'image', 'Client website screenshot'),
  ('Client Screenshot', 'clientScreenshot', 'image', 'Alias for client screenshot'),
  ('Client SS', 'clientSS', 'image', 'Short alias for client screenshot'),
  ('Competitor Screenshot URL', 'competitorScreenshotUrl', 'image', 'Competitor website screenshot'),
  ('Competitor Screenshot', 'competitorScreenshot', 'image', 'Alias for competitor screenshot'),
  ('Sending Account Name', 'sendingAccountName', 'text', 'Email sender account name'),
  ('Email', 'email', 'text', 'Sender email address');
