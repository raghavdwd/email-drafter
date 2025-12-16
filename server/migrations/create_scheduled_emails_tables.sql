-- Migration: Create scheduled_emails and sent_emails tables
-- Description: Add tables to support scheduled email sending with time intervals

-- Create scheduled_emails table
CREATE TABLE IF NOT EXISTS `scheduled_emails` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `file_id` VARCHAR(255) NOT NULL,
  `template_id` INT NOT NULL,
  `status` ENUM('pending', 'in_progress', 'paused', 'completed', 'cancelled', 'failed') NOT NULL DEFAULT 'pending',
  `time_interval_seconds` INT NOT NULL DEFAULT 60,
  `current_index` INT NOT NULL DEFAULT 0,
  `total_count` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `started_at` TIMESTAMP NULL,
  `completed_at` TIMESTAMP NULL,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_file_id` (`file_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`template_id`) REFERENCES `email_templates`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create sent_emails table
CREATE TABLE IF NOT EXISTS `sent_emails` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `scheduled_email_id` INT NULL,
  `user_id` INT NOT NULL,
  `row_id` INT NULL,
  `recipient_email` VARCHAR(255) NOT NULL,
  `subject` TEXT NOT NULL,
  `status` ENUM('sent', 'failed') NOT NULL,
  `message_id` VARCHAR(255) NULL,
  `error` TEXT NULL,
  `sent_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_scheduled_email_id` (`scheduled_email_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`scheduled_email_id`) REFERENCES `scheduled_emails`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`row_id`) REFERENCES `uploaded_rows`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
