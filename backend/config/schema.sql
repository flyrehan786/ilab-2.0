-- Create Database
CREATE DATABASE IF NOT EXISTS lab_management;
USE lab_management;

-- Users Table (for authentication)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'lab_technician', 'receptionist', 'doctor') NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  specialization VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  license_number VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  date_of_birth DATE,
  age INT,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  address TEXT,
  blood_group VARCHAR(10),
  emergency_contact VARCHAR(20),
  medical_history TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Test Categories Table
CREATE TABLE IF NOT EXISTS test_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tests Table
CREATE TABLE IF NOT EXISTS tests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  test_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  category_id INT,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  normal_range VARCHAR(200),
  unit VARCHAR(50),
  sample_type VARCHAR(100),
  preparation_instructions TEXT,
  turnaround_time INT COMMENT 'in hours',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES test_categories(id)
);

-- Patient Test Orders Table
CREATE TABLE IF NOT EXISTS patient_test_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id INT NOT NULL,
  doctor_id INT,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'sample_collected', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  priority ENUM('normal', 'urgent', 'stat') DEFAULT 'normal',
  total_amount DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  payment_status ENUM('unpaid', 'partial', 'paid') DEFAULT 'unpaid',
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Patient Test Order Items Table
CREATE TABLE IF NOT EXISTS patient_test_order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  test_id INT NOT NULL,
  test_name VARCHAR(200) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES patient_test_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (test_id) REFERENCES tests(id)
);

-- Test Results Table
CREATE TABLE IF NOT EXISTS test_results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_item_id INT NOT NULL,
  result_value VARCHAR(500),
  result_text TEXT,
  normal_range VARCHAR(200),
  unit VARCHAR(50),
  status ENUM('normal', 'abnormal', 'critical') DEFAULT 'normal',
  remarks TEXT,
  tested_by INT,
  tested_at TIMESTAMP,
  verified_by INT,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_item_id) REFERENCES patient_test_order_items(id) ON DELETE CASCADE,
  FOREIGN KEY (tested_by) REFERENCES users(id),
  FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('cash', 'card', 'upi', 'bank_transfer', 'insurance') NOT NULL,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  transaction_id VARCHAR(100),
  notes TEXT,
  received_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES patient_test_orders(id),
  FOREIGN KEY (received_by) REFERENCES users(id)
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  report_number VARCHAR(50) UNIQUE NOT NULL,
  report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  report_path VARCHAR(255),
  generated_by INT,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES patient_test_orders(id),
  FOREIGN KEY (generated_by) REFERENCES users(id)
);

-- Insert default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (username, email, password, role, full_name, phone) 
VALUES ('admin', 'admin@lab.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'System Administrator', '1234567890')
ON DUPLICATE KEY UPDATE id=id;

-- Insert sample test categories
INSERT INTO test_categories (name, description) VALUES
('Hematology', 'Blood related tests'),
('Biochemistry', 'Chemical analysis tests'),
('Microbiology', 'Infection and culture tests'),
('Immunology', 'Immune system tests'),
('Pathology', 'Tissue and cell examination')
ON DUPLICATE KEY UPDATE id=id;

-- Insert sample tests
INSERT INTO tests (test_code, name, category_id, price, normal_range, unit, sample_type, turnaround_time) VALUES
('CBC001', 'Complete Blood Count', 1, 500.00, '4.5-11.0', '10^9/L', 'Blood', 4),
('GLU001', 'Fasting Blood Sugar', 2, 200.00, '70-100', 'mg/dL', 'Blood', 2),
('LFT001', 'Liver Function Test', 2, 800.00, 'Various', 'Various', 'Blood', 6),
('KFT001', 'Kidney Function Test', 2, 700.00, 'Various', 'Various', 'Blood', 6),
('LIPID001', 'Lipid Profile', 2, 600.00, 'Various', 'mg/dL', 'Blood', 4),
('TSH001', 'Thyroid Stimulating Hormone', 4, 400.00, '0.4-4.0', 'mIU/L', 'Blood', 8),
('HBA1C001', 'HbA1c', 2, 500.00, '4.0-5.6', '%', 'Blood', 4),
('URINE001', 'Urine Routine', 3, 150.00, 'Normal', 'Various', 'Urine', 2)
ON DUPLICATE KEY UPDATE id=id;
