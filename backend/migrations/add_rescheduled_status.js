const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hospital_appointments'
  });

  try {
    await pool.execute(`
      ALTER TABLE appointments 
      MODIFY COLUMN status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'rescheduled') 
      DEFAULT 'pending'
    `);
    console.log('Status column updated successfully - added rescheduled status');
  } catch (error) {
    console.error('Migration error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

migrate();
