CREATE TABLE IF NOT EXISTS fundraiser_requests (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  beneficiary_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  story TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  deadline DATE NOT NULL,
  documents JSON NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'needs_revision') DEFAULT 'pending',
  admin_remarks TEXT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);
