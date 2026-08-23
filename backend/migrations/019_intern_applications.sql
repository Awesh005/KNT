CREATE TABLE IF NOT EXISTS intern_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  internship_id VARCHAR(100) NOT NULL,
  internship_title VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  college VARCHAR(255) NOT NULL,
  course VARCHAR(255) NOT NULL,
  year VARCHAR(50) DEFAULT NULL,
  duration VARCHAR(100) DEFAULT NULL,
  message TEXT,
  resume_url VARCHAR(500) DEFAULT NULL,
  status ENUM('new', 'reviewing', 'shortlisted', 'selected', 'rejected') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
