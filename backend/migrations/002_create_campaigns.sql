CREATE TABLE IF NOT EXISTS campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  story TEXT NOT NULL,
  cover_image VARCHAR(255),
  target_amount DECIMAL(15,2) NOT NULL,
  raised_amount DECIMAL(15,2) DEFAULT 0.00,
  deadline DATE NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'closed') DEFAULT 'pending',
  is_urgent BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);
