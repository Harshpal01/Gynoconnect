// Script to create notification tables in the database
const { poolPromise } = require('./config/database');

const createTables = async () => {
  try {
    const pool = await poolPromise;
    console.log('Connected to database...');

    // Create notifications table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'notifications')
      BEGIN
        CREATE TABLE notifications (
          id INT IDENTITY(1,1) PRIMARY KEY,
          appointment_id INT,
          patient_id INT,
          notification_type VARCHAR(50) NOT NULL,
          reminder_type VARCHAR(50) NOT NULL,
          recipient_email VARCHAR(255),
          recipient_phone VARCHAR(20),
          subject VARCHAR(255),
          message NVARCHAR(MAX),
          status VARCHAR(20) DEFAULT 'pending',
          error_message NVARCHAR(MAX),
          sent_at DATETIME,
          created_at DATETIME DEFAULT GETDATE()
        );
        PRINT 'Notifications table created';
      END
      ELSE
      BEGIN
        PRINT 'Notifications table already exists';
      END
    `);
    console.log('✅ Notifications table ready');

    // Create notification_settings table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'notification_settings')
      BEGIN
        CREATE TABLE notification_settings (
          id INT IDENTITY(1,1) PRIMARY KEY,
          user_id INT NOT NULL UNIQUE,
          email_notifications BIT DEFAULT 1,
          sms_notifications BIT DEFAULT 1,
          reminder_24h BIT DEFAULT 1,
          reminder_same_day BIT DEFAULT 1,
          reminder_1h BIT DEFAULT 0,
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE()
        );
        PRINT 'Notification settings table created';
      END
      ELSE
      BEGIN
        PRINT 'Notification settings table already exists';
      END
    `);
    console.log('✅ Notification settings table ready');

    // Add phone column to users table if it doesn't exist
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'phone')
      BEGIN
        ALTER TABLE users ADD phone VARCHAR(20);
        PRINT 'Phone column added to users table';
      END
      ELSE
      BEGIN
        PRINT 'Phone column already exists in users table';
      END
    `);
    console.log('✅ Users table phone column ready');

    console.log('\\n🎉 All notification tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
};

createTables();
