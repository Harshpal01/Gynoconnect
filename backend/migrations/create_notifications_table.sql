-- Create notifications table for tracking sent notifications
-- Run this script in SQL Server Management Studio or via sqlcmd

USE hospital_appointments;
GO

-- Drop table if exists (for fresh setup)
IF OBJECT_ID('notifications', 'U') IS NOT NULL
    DROP TABLE notifications;
GO

-- Create notifications table
CREATE TABLE notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    appointment_id INT NOT NULL,
    patient_id INT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'both'
    reminder_type VARCHAR(50) NOT NULL, -- '24_hour', 'same_day', '1_hour', 'confirmation', 'cancellation'
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'delivered'
    error_message TEXT,
    sent_at DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);
GO

-- Create index for faster queries
CREATE INDEX idx_notifications_appointment ON notifications(appointment_id);
CREATE INDEX idx_notifications_patient ON notifications(patient_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(notification_type, reminder_type);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at);
GO

-- Create notification_settings table for user preferences
IF OBJECT_ID('notification_settings', 'U') IS NOT NULL
    DROP TABLE notification_settings;
GO

CREATE TABLE notification_settings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    email_notifications BIT DEFAULT 1,
    sms_notifications BIT DEFAULT 1,
    reminder_24h BIT DEFAULT 1,
    reminder_same_day BIT DEFAULT 1,
    reminder_1h BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
GO

-- Create index for faster lookups
CREATE INDEX idx_notification_settings_user ON notification_settings(user_id);
GO

-- Add phone column to users table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'phone')
BEGIN
    ALTER TABLE users ADD phone VARCHAR(20);
END
GO

PRINT 'Notifications tables created successfully!';
PRINT 'Run this SQL to verify:';
PRINT 'SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME IN (''notifications'', ''notification_settings'');';
GO
