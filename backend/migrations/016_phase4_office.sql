ALTER TABLE media_files
  ADD COLUMN folder VARCHAR(120) DEFAULT 'General',
  ADD COLUMN title VARCHAR(255) DEFAULT NULL,
  ADD COLUMN visibility ENUM('public', 'internal', 'admin') DEFAULT 'internal',
  ADD COLUMN allowed_roles VARCHAR(255) DEFAULT 'Admin,Super Admin,Employee',
  ADD COLUMN description VARCHAR(500) DEFAULT NULL;

CREATE TABLE IF NOT EXISTS letter_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS letters (
  id VARCHAR(32) PRIMARY KEY,
  letter_no VARCHAR(80) NOT NULL,
  template_id INT DEFAULT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  addressee_name VARCHAR(255) NOT NULL,
  addressee_email VARCHAR(255) DEFAULT NULL,
  addressee_phone VARCHAR(30) DEFAULT NULL,
  pdf_url VARCHAR(255) DEFAULT NULL,
  verify_code VARCHAR(80) NOT NULL,
  status ENUM('draft', 'dispatched') DEFAULT 'dispatched',
  created_by VARCHAR(255) DEFAULT NULL,
  dispatched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_letter_no (letter_no),
  UNIQUE KEY uniq_letter_verify (verify_code)
);

CREATE TABLE IF NOT EXISTS letter_sends (
  id INT AUTO_INCREMENT PRIMARY KEY,
  letter_id VARCHAR(32) NOT NULL,
  channel ENUM('email', 'whatsapp') NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  status VARCHAR(40) DEFAULT 'logged',
  notes VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_letter_sends (letter_id)
);

CREATE TABLE IF NOT EXISTS office_settings (
  id TINYINT PRIMARY KEY DEFAULT 1,
  seal_url VARCHAR(255) DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO office_settings (id, seal_url) VALUES (1, NULL);

INSERT INTO letter_templates (name, subject, body) VALUES
  ('Thank you', 'Letter of thanks', 'Dear {{name}},\n\nOn behalf of KNT World Welfare Foundation we thank you for your support.\n\nWith gratitude,\nAuthorized Signatory'),
  ('Appointment', 'Appointment letter', 'Dear {{name}},\n\nThis is to confirm your association with KNT World Welfare Foundation.\n\nPlease keep this letter for your records.\n\nAuthorized Signatory'),
  ('General correspondence', 'Official communication', 'Dear {{name}},\n\n{{body}}\n\nYours faithfully,\nKNT World Welfare Foundation');
