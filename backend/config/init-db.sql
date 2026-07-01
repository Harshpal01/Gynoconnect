-- PostgreSQL Script for Hospital Appointment System
-- Run this against your target PostgreSQL database (for example: the Render database URL).

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'admin', 'doctor')),
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    medical_history TEXT,
    allergies TEXT,
    specialty VARCHAR(100),
    profile_image VARCHAR(255),
    is_featured BOOLEAN DEFAULT FALSE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT TRUE,
    reminder_24h BOOLEAN DEFAULT TRUE,
    reminder_same_day BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doctor_availability (
    id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blocked_slots (
    id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    blocked_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason VARCHAR(255),
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT,
    patient_name VARCHAR(100),
    patient_phone VARCHAR(20),
    doctor_id BIGINT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason VARCHAR(255),
    symptoms TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no-show')),
    source VARCHAR(20) NOT NULL DEFAULT 'online' CHECK (source IN ('online', 'phone', 'walk-in')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    appointment_id BIGINT,
    notification_type VARCHAR(50),
    type VARCHAR(50),
    channel VARCHAR(20),
    status VARCHAR(20),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

INSERT INTO users (name, email, password, role, phone)
VALUES ('John Patient', 'patient@example.com', '$2a$10$u7Jw0v9LahJcW4VRGMBUbO2DDefD9D3ADE3GxiHm8TgDCwNPjd5mO', 'patient', '0712345678')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password, role, phone)
VALUES ('Jane Admin', 'admin@example.com', '$2a$10$u7Jw0v9LahJcW4VRGMBUbO2DDefD9D3ADE3GxiHm8TgDCwNPjd5mO', 'admin', '0723456789')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password, role, phone, specialty, is_featured, profile_image)
VALUES ('Dr. Alex Morgan', 'doctor@example.com', '$2a$10$u7Jw0v9LahJcW4VRGMBUbO2DDefD9D3ADE3GxiHm8TgDCwNPjd5mO', 'doctor', '0734567890', 'Gynecology', TRUE, '/uploads/doctors/doctor-1770741639473-909033715.png')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password, role, phone, specialty, is_featured, profile_image)
VALUES ('Dr. Sarah Langat', 'sarahlangat@gmail.com', '$2a$10$u7Jw0v9LahJcW4VRGMBUbO2DDefD9D3ADE3GxiHm8TgDCwNPjd5mO', 'doctor', '0712345678', 'Gynecology', TRUE, '/uploads/doctors/doctor-1770741639473-909033715.png')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password, role, phone, specialty, is_featured, profile_image)
VALUES ('Dr. Dominic Kipkorir', 'dominickipkorir@gmail.com', '$2a$10$u7Jw0v9LahJcW4VRGMBUbO2DDefD9D3ADE3GxiHm8TgDCwNPjd5mO', 'doctor', '0723456789', 'Obstetrics', TRUE, '/uploads/doctors/doctor-1770741655353-470129534.png')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password, role, phone, specialty, is_featured, profile_image)
VALUES ('Dr. Teddy Ochieng', 'teddyochieng@gmail.com', '$2a$10$u7Jw0v9LahJcW4VRGMBUbO2DDefD9D3ADE3GxiHm8TgDCwNPjd5mO', 'doctor', '0734567890', 'Pediatrics', TRUE, '/uploads/doctors/doctor-1770741666703-796838445.png')
ON CONFLICT (email) DO NOTHING;

INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'monday', '08:00:00', '17:00:00' FROM users WHERE email = 'sarahlangat@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'tuesday', '08:00:00', '17:00:00' FROM users WHERE email = 'sarahlangat@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'wednesday', '08:00:00', '17:00:00' FROM users WHERE email = 'sarahlangat@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'thursday', '08:00:00', '17:00:00' FROM users WHERE email = 'sarahlangat@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'friday', '08:00:00', '17:00:00' FROM users WHERE email = 'sarahlangat@gmail.com'
ON CONFLICT DO NOTHING;

SELECT 'Database setup completed successfully!' AS message;
