const cron = require('node-cron');
const { pool } = require('../config/database');
const { sendAppointmentReminder } = require('./emailService');
const { sendAppointmentReminderSMS, sendSameDayReminderSMS } = require('./smsService');

// Track sent reminders to avoid duplicates
const sentReminders = new Set();

// Format time helper
const formatTime = (timeValue) => {
  if (!timeValue) return '';
  
  // Convert to string if it's not already
  const timeString = String(timeValue);
  
  try {
    // Handle ISO datetime format
    if (timeString.includes('T')) {
      const timePart = timeString.split('T')[1]?.split('.')[0];
      if (timePart) {
        const [hours, minutes] = timePart.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
      }
    }
    // Handle time-only format (HH:MM:SS or HH:MM)
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }
  } catch (error) {
    console.error('Error formatting time:', error);
  }
  return timeString;
};

// Get appointments for tomorrow (24-hour reminder)
const getTomorrowAppointments = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextDay = new Date(tomorrow);
    nextDay.setDate(nextDay.getDate() + 1);

    const [rows] = await pool.execute(`
      SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.reason,
        a.status,
        COALESCE(u.name, a.patient_name) as patient_name,
        COALESCE(u.email, '') as patient_email,
        COALESCE(u.phone, a.patient_phone) as patient_phone,
        d.name as doctor_name
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN users d ON a.doctor_id = d.id
      WHERE a.appointment_date >= ? 
        AND a.appointment_date < ?
        AND a.status IN ('pending', 'confirmed')
    `, [tomorrow, nextDay]);

    return rows;
  } catch (error) {
    console.error('Error fetching tomorrow appointments:', error);
    return [];
  }
};

// Get appointments for today (same-day reminder)
const getTodayAppointments = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [rows] = await pool.execute(`
      SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.reason,
        a.status,
        COALESCE(u.name, a.patient_name) as patient_name,
        COALESCE(u.email, '') as patient_email,
        COALESCE(u.phone, a.patient_phone) as patient_phone,
        d.name as doctor_name
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN users d ON a.doctor_id = d.id
      WHERE a.appointment_date >= ? 
        AND a.appointment_date < ?
        AND a.status IN ('pending', 'confirmed')
    `, [today, tomorrow]);

    return rows;
  } catch (error) {
    console.error('Error fetching today appointments:', error);
    return [];
  }
};

// Log notification to database
const logNotification = async (appointmentId, type, channel, status, message = '') => {
  try {
    await pool.execute(`
      INSERT INTO notifications (appointment_id, notification_type, channel, status, message, sent_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [appointmentId, type, channel, status, message]);
  } catch (error) {
    // Table might not exist yet, just log
    console.log('Notification logged (table may not exist):', { appointmentId, type, channel, status });
  }
};

// Send 24-hour reminders
const send24HourReminders = async () => {
  console.log('🔔 Running 24-hour reminder check...');
  
  const appointments = await getTomorrowAppointments();
  console.log(`Found ${appointments.length} appointments for tomorrow`);

  const enableSMS = process.env.ENABLE_SMS_NOTIFICATIONS === 'true';
  const enableEmail = process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false';

  for (const apt of appointments) {
    const reminderId = `24h-${apt.id}-${new Date().toDateString()}`;
    
    if (sentReminders.has(reminderId)) {
      continue; // Already sent today
    }

    const appointmentDetails = {
      patientName: apt.patient_name,
      appointmentDate: apt.appointment_date,
      appointmentTime: formatTime(apt.appointment_time),
      reason: apt.reason,
      doctorName: apt.doctor_name,
    };

    // Send Email Reminder
    if (enableEmail && apt.patient_email) {
      const emailSent = await sendAppointmentReminder(apt.patient_email, appointmentDetails);
      await logNotification(apt.id, '24_hour_reminder', 'email', emailSent ? 'sent' : 'failed');
      console.log(`📧 24h Email reminder ${emailSent ? 'sent' : 'failed'} to ${apt.patient_email}`);
    }

    // Send SMS Reminder
    if (enableSMS && apt.patient_phone) {
      const smsSent = await sendAppointmentReminderSMS(apt.patient_phone, appointmentDetails);
      await logNotification(apt.id, '24_hour_reminder', 'sms', smsSent ? 'sent' : 'failed');
      console.log(`📱 24h SMS reminder ${smsSent ? 'sent' : 'failed'} to ${apt.patient_phone}`);
    }

    sentReminders.add(reminderId);
  }
};

// Send same-day reminders (morning of appointment)
const sendSameDayReminders = async () => {
  console.log('🔔 Running same-day reminder check...');
  
  const appointments = await getTodayAppointments();
  console.log(`Found ${appointments.length} appointments for today`);

  const enableSMS = process.env.ENABLE_SMS_NOTIFICATIONS === 'true';

  for (const apt of appointments) {
    const reminderId = `today-${apt.id}-${new Date().toDateString()}`;
    
    if (sentReminders.has(reminderId)) {
      continue; // Already sent today
    }

    const appointmentDetails = {
      patientName: apt.patient_name,
      appointmentDate: apt.appointment_date,
      appointmentTime: formatTime(apt.appointment_time),
      reason: apt.reason,
      doctorName: apt.doctor_name,
    };

    // Send SMS Reminder (SMS is better for same-day)
    if (enableSMS && apt.patient_phone) {
      const smsSent = await sendSameDayReminderSMS(apt.patient_phone, appointmentDetails);
      await logNotification(apt.id, 'same_day_reminder', 'sms', smsSent ? 'sent' : 'failed');
      console.log(`📱 Same-day SMS reminder ${smsSent ? 'sent' : 'failed'} to ${apt.patient_phone}`);
    }

    sentReminders.add(reminderId);
  }
};

// Initialize reminder scheduler
const initializeReminderScheduler = () => {
  console.log('📅 Initializing appointment reminder scheduler...');

  // Run 24-hour reminders every day at 6 PM (18:00)
  // Sends reminders for tomorrow's appointments
  cron.schedule('0 18 * * *', async () => {
    console.log('⏰ 6 PM - Running 24-hour appointment reminders');
    await send24HourReminders();
  }, {
    timezone: 'Africa/Nairobi'
  });

  // Run same-day reminders every day at 7 AM
  // Sends reminders for today's appointments
  cron.schedule('0 7 * * *', async () => {
    console.log('⏰ 7 AM - Running same-day appointment reminders');
    await sendSameDayReminders();
  }, {
    timezone: 'Africa/Nairobi'
  });

  // Also run a check every hour during business hours (8 AM - 5 PM)
  cron.schedule('0 8-17 * * *', async () => {
    console.log('⏰ Hourly check - Running reminder checks');
    await send24HourReminders();
    await sendSameDayReminders();
  }, {
    timezone: 'Africa/Nairobi'
  });

  console.log('✅ Reminder scheduler initialized');
  console.log('   - 24-hour reminders: Daily at 6 PM EAT');
  console.log('   - Same-day reminders: Daily at 7 AM EAT');
  console.log('   - Hourly checks: 8 AM - 5 PM EAT');

  // Run initial check on startup (after 10 seconds to let DB connect)
  setTimeout(async () => {
    console.log('🚀 Running initial reminder check...');
    await send24HourReminders();
    await sendSameDayReminders();
  }, 10000);
};

// Manual trigger for testing
const triggerReminders = async () => {
  console.log('🔔 Manually triggering all reminders...');
  await send24HourReminders();
  await sendSameDayReminders();
  return { success: true, message: 'Reminders triggered' };
};

module.exports = {
  initializeReminderScheduler,
  send24HourReminders,
  sendSameDayReminders,
  triggerReminders,
};
