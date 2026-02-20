-- MySQL Script for Hospital Appointment System
-- Run this in MySQL Workbench or command line

-- Create database
CREATE DATABASE IF NOT EXISTS hospital_appointments;
USE hospital_appointments;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('patient', 'admin', 'doctor') DEFAULT 'patient',
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    medical_history TEXT,
    allergies TEXT,
    specialty VARCHAR(100),
    profile_image VARCHAR(255),
    is_featured TINYINT(1) DEFAULT 0,
    email_notifications TINYINT(1) DEFAULT 1,
    sms_notifications TINYINT(1) DEFAULT 1,
    reminder_24h TINYINT(1) DEFAULT 1,
    reminder_same_day TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Doctor availability table
CREATE TABLE IF NOT EXISTS doctor_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available TINYINT(1) DEFAULT 1,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Blocked slots table
CREATE TABLE IF NOT EXISTS blocked_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    blocked_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason VARCHAR(255),
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    patient_name VARCHAR(100),
    patient_phone VARCHAR(20),
    doctor_id INT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason VARCHAR(255),
    symptoms TEXT,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no-show') DEFAULT 'pending',
    source ENUM('online', 'phone', 'walk-in') DEFAULT 'online',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    appointment_id INT,
    notification_type VARCHAR(50),
    type VARCHAR(50),
    channel VARCHAR(20),
    status VARCHAR(20),
    message TEXT,
    is_read TINYINT(1) DEFAULT 0,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- Insert demo users (password: demo123)
-- Hash for 'demo123': $2a$10$xPPPGn5rkxJKmJLGfRNLaOJGRNhVLxTKqXrVGK8mJtj3LrLpW.kLC

INSERT IGNORE INTO users (name, email, password, role, phone) VALUES
('John Patient', 'patient@example.com', '$2a$10$xPPPGn5rkxJKmJLGfRNLaOJGRNhVLxTKqXrVGK8mJtj3LrLpW.kLC', 'patient', '0712345678');

INSERT IGNORE INTO users (name, email, password, role, phone) VALUES
('Jane Admin', 'admin@example.com', '$2a$10$xPPPGn5rkxJKmJLGfRNLaOJGRNhVLxTKqXrVGK8mJtj3LrLpW.kLC', 'admin', '0723456789');

INSERT IGNORE INTO users (name, email, password, role, phone, specialty, is_featured) VALUES
('Dr. Sarah Smith', 'doctor@example.com', '$2a$10$xPPPGn5rkxJKmJLGfRNLaOJGRNhVLxTKqXrVGK8mJtj3LrLpW.kLC', 'doctor', '0734567890', 'General Practitioner', 1);

-- Insert doctor availability (Monday to Friday, 8am to 5pm)
INSERT IGNORE INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'monday', '08:00:00', '17:00:00' FROM users WHERE email = 'doctor@example.com';

INSERT IGNORE INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'tuesday', '08:00:00', '17:00:00' FROM users WHERE email = 'doctor@example.com';

INSERT IGNORE INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'wednesday', '08:00:00', '17:00:00' FROM users WHERE email = 'doctor@example.com';

INSERT IGNORE INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'thursday', '08:00:00', '17:00:00' FROM users WHERE email = 'doctor@example.com';

INSERT IGNORE INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'friday', '08:00:00', '17:00:00' FROM users WHERE email = 'doctor@example.com';

SELECT 'Database setup completed successfully!' AS message;
