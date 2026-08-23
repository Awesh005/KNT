-- Phase 6: SBI ePay orders, mail templates/log, email verify, admin 2FA

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'donations' AND COLUMN_NAME = 'gateway');
SET @sql := IF(@col = 0, 'ALTER TABLE donations ADD COLUMN gateway VARCHAR(40) NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'donations' AND COLUMN_NAME = 'gateway_order_no');
SET @sql := IF(@col = 0, 'ALTER TABLE donations ADD COLUMN gateway_order_no VARCHAR(80) NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'donations' AND COLUMN_NAME = 'gateway_ref');
SET @sql := IF(@col = 0, 'ALTER TABLE donations ADD COLUMN gateway_ref VARCHAR(80) NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'donations' AND COLUMN_NAME = 'gateway_payload');
SET @sql := IF(@col = 0, 'ALTER TABLE donations ADD COLUMN gateway_payload JSON NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE donations
  MODIFY COLUMN status ENUM('pending', 'verified', 'failed', 'refunded') DEFAULT 'pending';

CREATE TABLE IF NOT EXISTS payment_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donation_id VARCHAR(255) NOT NULL,
  merchant_order_no VARCHAR(80) NOT NULL UNIQUE,
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(40) DEFAULT 'created',
  raw_response TEXT,
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pay_donation (donation_id)
);

CREATE TABLE IF NOT EXISTS mail_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_key VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  html MEDIUMTEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mail_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_key VARCHAR(80) NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status ENUM('sent', 'skipped', 'failed') NOT NULL,
  error TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mail_log_created (created_at)
);

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email_verified');
SET @sql := IF(@col = 0, 'ALTER TABLE users ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 1', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email_verify_token');
SET @sql := IF(@col = 0, 'ALTER TABLE users ADD COLUMN email_verify_token VARCHAR(128) NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'totp_secret');
SET @sql := IF(@col = 0, 'ALTER TABLE users ADD COLUMN totp_secret VARCHAR(64) NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'totp_enabled');
SET @sql := IF(@col = 0, 'ALTER TABLE users ADD COLUMN totp_enabled TINYINT(1) NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

INSERT IGNORE INTO mail_templates (template_key, name, subject, html) VALUES
('donation_received', 'Donation received', 'We received your donation — KNT World Welfare Foundation', '<p>Dear {{name}},</p><p>Thank you for donating <strong>INR {{amount}}</strong>{{campaign}}.</p><p>Your payment is under verification. We will email your receipt once our team confirms the transfer.</p><p>Reference: {{id}}</p>'),
('donation_verified', 'Donation verified', 'Donation verified — your receipt is ready', '<p>Dear {{name}},</p><p>Your donation of <strong>INR {{amount}}</strong> has been verified.</p><p>Thank you for supporting our work.</p>'),
('payment_success', 'SBI payment success', 'Payment received — KNT World Welfare Foundation', '<p>Dear {{name}},</p><p>SBI ePay confirmed your donation of <strong>INR {{amount}}</strong>. Your receipt will follow by email.</p><p>Reference: {{id}}</p>'),
('enquiry_alert', 'Enquiry alert', 'New enquiry from {{name}}', '<p>A new contact enquiry was submitted.</p><p><strong>Name:</strong> {{name}}<br/><strong>Email:</strong> {{email}}<br/><strong>Phone:</strong> {{phone}}</p><p>{{message}}</p>'),
('job_application_alert', 'Job application alert', 'New job application: {{name}}', '<p>A new job application was submitted for {{job_title}}.</p><p>{{name}} · {{email}} · {{phone}}</p>'),
('password_reset', 'Password reset', 'Reset your password — KNT World Welfare Foundation', '<p>You requested a password reset.</p><p><a href="{{resetUrl}}">Click here to reset your password</a>. This link expires in 1 hour.</p>'),
('email_verify', 'Email verification', 'Verify your email — KNT World Welfare Foundation', '<p>Dear {{name}},</p><p>Please <a href="{{verifyUrl}}">verify your email</a> to activate your account.</p>'),
('membership_approved', 'Membership approved', 'Membership approved — KNT World Welfare Foundation', '<p>Dear {{name}},</p><p>Your membership is active. Member no: <strong>{{member_no}}</strong>.</p>'),
('volunteer_approved', 'Volunteer approved', 'Volunteer application approved', '<p>Dear {{name}},</p><p>You are now a KNT volunteer ({{volunteer_no}}).</p>'),
('employee_welcome', 'Employee welcome', 'Welcome to KNT World Welfare Foundation', '<p>Dear {{name}},</p><p>You have been onboarded as {{designation}} ({{employee_no}}).</p>');
