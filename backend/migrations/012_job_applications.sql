CREATE TABLE IF NOT EXISTS job_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id VARCHAR(100) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  qualification VARCHAR(255) NOT NULL,
  experience TEXT,
  documents JSON DEFAULT NULL,
  status ENUM('new', 'reviewing', 'shortlisted', 'rejected', 'hired') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
