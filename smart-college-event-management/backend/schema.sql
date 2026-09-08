-- =============================================================================
-- SMART COLLEGE EVENT MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Target Database Engine: MySQL 8.0+
-- Database: smart_college_events
-- =============================================================================

CREATE DATABASE IF NOT EXISTS smart_college_events;
USE smart_college_events;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  alternate_email VARCHAR(150),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'organizer', 'admin') NOT NULL DEFAULT 'student',
  student_id VARCHAR(50),
  employee_id VARCHAR(50),
  department VARCHAR(100),
  year VARCHAR(50),
  phone VARCHAR(30),
  avatar VARCHAR(50),
  skills TEXT,
  designation VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  department VARCHAR(100),
  description TEXT,
  banner VARCHAR(500),
  date DATE NOT NULL,
  start_time VARCHAR(50),
  end_time VARCHAR(50),
  venue VARCHAR(200) NOT NULL,
  organizer_id VARCHAR(50),
  organizer_name VARCHAR(150),
  max_participants INT NOT NULL DEFAULT 100,
  registered_count INT NOT NULL DEFAULT 0,
  registration_deadline DATE,
  status ENUM('Upcoming', 'Ongoing', 'Completed', 'Cancelled') DEFAULT 'Upcoming',
  rules TEXT,
  eligibility TEXT,
  fee VARCHAR(50) DEFAULT 'Free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_dept (department),
  INDEX idx_status (status),
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS registrations (
  id VARCHAR(50) PRIMARY KEY,
  event_id VARCHAR(50) NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  student_name VARCHAR(100) NOT NULL,
  student_roll VARCHAR(50),
  department VARCHAR(100),
  registered_at VARCHAR(50),
  status ENUM('Confirmed', 'Waitlisted', 'Cancelled') DEFAULT 'Confirmed',
  attendance ENUM('Pending', 'Present', 'Absent') DEFAULT 'Pending',
  certificate_available BOOLEAN DEFAULT FALSE,
  certificate_id VARCHAR(50),
  qr_pass_code VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event (event_id),
  INDEX idx_student (student_id),
  INDEX idx_qr (qr_pass_code),
  CONSTRAINT fk_reg_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_reg_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS certificates (
  id VARCHAR(50) PRIMARY KEY,
  event_id VARCHAR(50) NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  student_name VARCHAR(100) NOT NULL,
  student_roll VARCHAR(50),
  department VARCHAR(100),
  type VARCHAR(100) DEFAULT 'Certificate of Excellence',
  issue_date DATE,
  status VARCHAR(50) DEFAULT 'Issued',
  issued_by VARCHAR(200),
  verification_code VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cert_student (student_id),
  INDEX idx_cert_code (verification_code),
  CONSTRAINT fk_cert_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_cert_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. EVENT RESULTS TABLE
CREATE TABLE IF NOT EXISTS event_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id VARCHAR(50) NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  published_date DATE,
  winner_first TEXT,
  winner_second TEXT,
  winner_third TEXT,
  special_mention TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_res_event (event_id),
  CONSTRAINT fk_res_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL DEFAULT 'all',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  date DATE,
  unread BOOLEAN DEFAULT TRUE,
  type VARCHAR(50) DEFAULT 'event',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notif_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS feedback (
  id VARCHAR(50) PRIMARY KEY,
  event_id VARCHAR(50) NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  student_name VARCHAR(100) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  submitted_at DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_fb_event (event_id),
  INDEX idx_fb_student (student_id),
  CONSTRAINT fk_fb_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_fb_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
