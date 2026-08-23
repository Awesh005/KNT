-- Phase 5: project geo/SDG fields, beneficiaries, progress updates.
-- Column adds are skipped if they already exist (student_details is in some dumps).

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'campaigns' AND COLUMN_NAME = 'latitude');
SET @sql := IF(@col = 0, 'ALTER TABLE campaigns ADD COLUMN latitude DECIMAL(10,7) NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'campaigns' AND COLUMN_NAME = 'longitude');
SET @sql := IF(@col = 0, 'ALTER TABLE campaigns ADD COLUMN longitude DECIMAL(10,7) NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'campaigns' AND COLUMN_NAME = 'location_label');
SET @sql := IF(@col = 0, 'ALTER TABLE campaigns ADD COLUMN location_label VARCHAR(255) NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'campaigns' AND COLUMN_NAME = 'program_key');
SET @sql := IF(@col = 0, 'ALTER TABLE campaigns ADD COLUMN program_key VARCHAR(120) NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'campaigns' AND COLUMN_NAME = 'sdg_tags');
SET @sql := IF(@col = 0, 'ALTER TABLE campaigns ADD COLUMN sdg_tags VARCHAR(255) NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'campaigns' AND COLUMN_NAME = 'student_details');
SET @sql := IF(@col = 0, 'ALTER TABLE campaigns ADD COLUMN student_details JSON NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS beneficiaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id INT NULL,
  program_key VARCHAR(120) NULL,
  kind ENUM('patient', 'student', 'other') NOT NULL DEFAULT 'other',
  name VARCHAR(255) NOT NULL,
  age INT NULL,
  gender VARCHAR(20) NULL,
  city VARCHAR(100) NULL,
  details JSON NULL,
  photo_url VARCHAR(255) NULL,
  status ENUM('active', 'completed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ben_campaign (campaign_id)
);

CREATE TABLE IF NOT EXISTS campaign_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  photo_urls JSON,
  is_public TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_updates_campaign (campaign_id)
);
