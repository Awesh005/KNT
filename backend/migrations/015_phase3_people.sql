ALTER TABLE users
  MODIFY COLUMN role ENUM('Guest', 'Donor', 'Requester', 'Admin', 'Super Admin', 'Member', 'Volunteer', 'Employee') DEFAULT 'Guest';

CREATE TABLE IF NOT EXISTS people_counters (
  kind VARCHAR(32) PRIMARY KEY,
  last_no INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS memberships (
  id VARCHAR(32) PRIMARY KEY,
  user_id VARCHAR(255) DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  membership_type ENUM('annual', 'lifetime', 'student') NOT NULL,
  fee DECIMAL(10,2) NOT NULL,
  payment_ref VARCHAR(255) DEFAULT NULL,
  screenshot_url VARCHAR(255) DEFAULT NULL,
  photo_url VARCHAR(255) DEFAULT NULL,
  kyc_pan VARCHAR(20) DEFAULT NULL,
  kyc_id_type VARCHAR(50) DEFAULT NULL,
  kyc_id_number VARCHAR(80) DEFAULT NULL,
  address VARCHAR(500) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  status ENUM('pending', 'active', 'expired', 'rejected') DEFAULT 'pending',
  member_no VARCHAR(50) DEFAULT NULL,
  started_at DATE DEFAULT NULL,
  expires_at DATE DEFAULT NULL,
  id_card_url VARCHAR(255) DEFAULT NULL,
  certificate_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_member_no (member_no),
  INDEX idx_memberships_email (email),
  INDEX idx_memberships_status (status)
);

CREATE TABLE IF NOT EXISTS membership_receipts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  membership_id VARCHAR(32) NOT NULL,
  receipt_no VARCHAR(80) NOT NULL,
  fy VARCHAR(16) DEFAULT NULL,
  amount DECIMAL(10,2) NOT NULL,
  pdf_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS volunteers (
  id VARCHAR(32) PRIMARY KEY,
  user_id VARCHAR(255) DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  photo_url VARCHAR(255) DEFAULT NULL,
  skills VARCHAR(500) DEFAULT NULL,
  availability VARCHAR(255) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  message TEXT,
  status ENUM('pending', 'active', 'rejected', 'inactive') DEFAULT 'pending',
  volunteer_no VARCHAR(50) DEFAULT NULL,
  id_card_url VARCHAR(255) DEFAULT NULL,
  hours_total DECIMAL(8,1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_volunteer_no (volunteer_no),
  INDEX idx_volunteers_email (email)
);

CREATE TABLE IF NOT EXISTS volunteer_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  volunteer_id VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(500) DEFAULT NULL,
  scheduled_at DATE DEFAULT NULL,
  hours DECIMAL(6,1) DEFAULT 0,
  status ENUM('assigned', 'done', 'cancelled') DEFAULT 'assigned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS volunteer_hours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  volunteer_id VARCHAR(32) NOT NULL,
  work_date DATE NOT NULL,
  hours DECIMAL(6,1) NOT NULL,
  notes VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(32) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  employee_no VARCHAR(50) NOT NULL,
  designation VARCHAR(150) DEFAULT NULL,
  department VARCHAR(150) DEFAULT NULL,
  join_date DATE DEFAULT NULL,
  photo_url VARCHAR(255) DEFAULT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  job_application_id INT DEFAULT NULL,
  welcome_kit_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_employee_no (employee_no),
  UNIQUE KEY uniq_employee_user (user_id)
);

CREATE TABLE IF NOT EXISTS employee_docs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  created_by VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(32) NOT NULL,
  work_date DATE NOT NULL,
  check_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  check_in_method ENUM('manual', 'qr') DEFAULT 'manual',
  UNIQUE KEY uniq_attendance_day (employee_id, work_date)
);

CREATE TABLE IF NOT EXISTS leave_balances (
  employee_id VARCHAR(32) PRIMARY KEY,
  casual INT DEFAULT 12,
  sick INT DEFAULT 8,
  earned INT DEFAULT 15
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(32) NOT NULL,
  leave_type ENUM('casual', 'sick', 'earned') NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  days DECIMAL(4,1) NOT NULL,
  reason VARCHAR(500) DEFAULT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
