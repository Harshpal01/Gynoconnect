const express = require('express');
const { pool } = require('../config/database');
const { authMiddleware, authorize } = require('../middleware/auth');
const { sendAppointmentConfirmation, sendAppointmentReminder, sendCancellationNotification } = require('../services/emailService');
const { sendAppointmentConfirmationSMS, sendAppointmentReminderSMS, sendCancellationSMS } = require('../services/smsService');
const { triggerReminders } = require('../services/reminderScheduler');

const router = express.Router();

// Get notification history
router.get('/history', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        n.*,
        a.appointment_date,
        a.appointment_time,
        COALESCE(u.name, a.patient_name) as patient_name
      FROM notifications n
      LEFT JOIN appointments a ON n.appointment_id = a.id
      LEFT JOIN users u ON a.patient_id = u.id
      ORDER BY n.sent_at DESC
      LIMIT 100
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching notification history:', error);
    res.status(500).json({ message: 'Failed to fetch notification history' });
  }
});

// Manually trigger reminders (admin only)
router.post('/trigger-reminders', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const result = await triggerReminders();
    res.json(result);
  } catch (error) {
    console.error('Error triggering reminders:', error);
    res.status(500).json({ message: 'Failed to trigger reminders' });
  }
});

// Send test notification
router.post('/test', authMiddleware, authorize('admin'), async (req, res) => {
  const { type, channel, email, phone, appointmentId } = req.body;

  try {
    // Get appointment details if provided
    let appointmentDetails = {
      patientName: 'Test Patient',
      appointmentDate: new Date(),
      appointmentTime: '10:00 AM',
      reason: 'Test Appointment',
      doctorName: 'Dr. Test',
    };

    if (appointmentId) {
      const [rows] = await pool.execute(`
        SELECT 
          a.*,
          COALESCE(u.name, a.patient_name) as patient_name,
          d.name as doctor_name
        FROM appointments a
        LEFT JOIN users u ON a.patient_id = u.id
        LEFT JOIN users d ON a.doctor_id = d.id
        WHERE a.id = ?
      `, [appointmentId]);

      if (rows.length > 0) {
        const apt = rows[0];
        appointmentDetails = {
          patientName: apt.patient_name,
          appointmentDate: apt.appointment_date,
          appointmentTime: apt.appointment_time,
          reason: apt.reason,
          doctorName: apt.doctor_name,
        };
      }
    }

    let success = false;
    let message = '';

    if (channel === 'email' && email) {
      if (type === 'confirmation') {
        success = await sendAppointmentConfirmation(email, appointmentDetails);
      } else if (type === 'reminder') {
        success = await sendAppointmentReminder(email, appointmentDetails);
      } else if (type === 'cancellation') {
        success = await sendCancellationNotification(email, appointmentDetails);
      }
      message = success ? `Email sent to ${email}` : `Failed to send email to ${email}`;
    } else if (channel === 'sms' && phone) {
      if (type === 'confirmation') {
        success = await sendAppointmentConfirmationSMS(phone, appointmentDetails);
      } else if (type === 'reminder') {
        success = await sendAppointmentReminderSMS(phone, appointmentDetails);
      } else if (type === 'cancellation') {
        success = await sendCancellationSMS(phone, appointmentDetails);
      }
      message = success ? `SMS sent to ${phone}` : `Failed to send SMS to ${phone}`;
    } else {
      return res.status(400).json({ message: 'Invalid channel or missing contact info' });
    }

    res.json({ success, message });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ message: 'Failed to send test notification' });
  }
});

// Get notification settings
router.get('/settings', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        email_notifications,
        sms_notifications,
        reminder_24h,
        reminder_same_day
      FROM users 
      WHERE id = ?
    `, [req.user.id]);

    if (rows.length === 0) {
      return res.json({
        email_notifications: true,
        sms_notifications: true,
        reminder_24h: true,
        reminder_same_day: true,
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    // Return defaults if columns don't exist
    res.json({
      email_notifications: true,
      sms_notifications: true,
      reminder_24h: true,
      reminder_same_day: true,
    });
  }
});

// Update notification settings
router.put('/settings', authMiddleware, async (req, res) => {
  const { email_notifications, sms_notifications, reminder_24h, reminder_same_day } = req.body;

  try {
    await pool.execute(`
      UPDATE users 
      SET 
        email_notifications = ?,
        sms_notifications = ?,
        reminder_24h = ?,
        reminder_same_day = ?
      WHERE id = ?
    `, [email_notifications, sms_notifications, reminder_24h, reminder_same_day, req.user.id]);

    res.json({ message: 'Notification settings updated successfully' });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ message: 'Failed to update notification settings' });
  }
});

module.exports = router;
