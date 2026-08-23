ALTER TABLE donations
  ADD COLUMN guest_address VARCHAR(500) DEFAULT NULL,
  ADD COLUMN guest_city VARCHAR(100) DEFAULT NULL,
  ADD COLUMN guest_state VARCHAR(100) DEFAULT NULL,
  ADD COLUMN guest_pincode VARCHAR(20) DEFAULT NULL,
  ADD COLUMN payment_mode VARCHAR(50) DEFAULT 'UPI';

CREATE TABLE IF NOT EXISTS donor_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donor_key VARCHAR(255) NOT NULL,
  author_id VARCHAR(255) DEFAULT NULL,
  author_name VARCHAR(255) DEFAULT NULL,
  note TEXT NOT NULL,
  follow_up_at DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_donor_notes_key (donor_key)
);

CREATE TABLE IF NOT EXISTS donor_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donor_key VARCHAR(255) NOT NULL,
  tag VARCHAR(80) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_donor_tag (donor_key, tag),
  INDEX idx_donor_tags_key (donor_key)
);

CREATE TABLE IF NOT EXISTS receipt_counters (
  fy VARCHAR(16) PRIMARY KEY,
  last_no INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finance_heads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  description VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  head_id INT NOT NULL,
  program_id INT DEFAULT NULL,
  campaign_id INT DEFAULT NULL,
  amount DECIMAL(15,2) NOT NULL,
  expense_date DATE NOT NULL,
  voucher_no VARCHAR(80) DEFAULT NULL,
  description VARCHAR(500) DEFAULT NULL,
  created_by VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_expenses_date (expense_date),
  CONSTRAINT fk_expenses_head FOREIGN KEY (head_id) REFERENCES finance_heads(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fy VARCHAR(16) NOT NULL,
  program_id INT DEFAULT NULL,
  campaign_id INT DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  allocated DECIMAL(15,2) NOT NULL DEFAULT 0,
  notes VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_budget_scope (fy, title, program_id, campaign_id)
);

CREATE TABLE IF NOT EXISTS annual_statements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donor_key VARCHAR(255) NOT NULL,
  fy VARCHAR(16) NOT NULL,
  pdf_url VARCHAR(255) NOT NULL,
  emailed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_statement (donor_key, fy)
);

INSERT INTO finance_heads (name, type, description) VALUES
  ('Donations', 'income', 'Verified public donations and campaign gifts'),
  ('Program expense', 'expense', 'Direct program / welfare spend'),
  ('Admin expense', 'expense', 'Office, staff, and operating costs'),
  ('Campaign payout', 'expense', 'Funds transferred to campaign beneficiaries');
