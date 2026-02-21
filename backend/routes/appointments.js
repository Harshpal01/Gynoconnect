const express = require('express');
const { pool } = require('../config/database');
const { authMiddleware, authorize } = require('../middleware/auth');
const {
  sendAppointmentConfirmation,
  sendCancellationNotification,
  sendRescheduleNotification,
} = require('../services/emailService');
const {
  sendAppointmentConfirmationSMS,
  sendCancellationSMS,
  sendRescheduleSMS,
} = require('../services/smsService');

const router = express.Router();

// Get all appointments (filtered by role)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = `
      SELECT 
        a.id,
        a.patient_id,
        COALESCE(u.name, a.patient_name) as patient_name,
        COALESCE(u.phone, a.patient_phone) as patient_phone,
        a.doctor_id,
        d.name as doctor_name,
        a.appointment_date,
        a.appointment_time,
        a.reason,
        a.symptoms,
        a.status,
        a.source,
        a.notes,
        a.created_at,
        a.updated_at
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN users d ON a.doctor_id = d.id
    `;

    const params = [];

    if (req.user.role === 'patient') {
      query += ' WHERE a.patient_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'doctor') {
      query += ' WHERE a.doctor_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const [rows] = await pool.execute(query, params);

    const transformedAppointments = rows.map((apt) => ({
      id: apt.id,
      patientId: apt.patient_id,
      patientName: apt.patient_name,
      patientPhone: apt.patient_phone,
      doctorId: apt.doctor_id,
      doctorName: apt.doctor_name,
      appointmentDate: apt.appointment_date,
      appointmentTime: apt.appointment_time,
      reason: apt.reason,
      symptoms: apt.symptoms,
      status: apt.status,
      source: apt.source,
      notes: apt.notes,
      createdAt: apt.created_at,
      updatedAt: apt.updated_at,
    }));

    res.json(transformedAppointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
});

// Get appointment by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        a.*,
        u.name as patient_name,
        u.phone as patient_phone,
        d.name as doctor_name
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN users d ON a.doctor_id = d.id
      WHERE a.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const apt = rows[0];
    res.json({
      id: apt.id,
      patientId: apt.patient_id,
      patientName: apt.patient_name,
      patientPhone: apt.patient_phone,
      doctorId: apt.doctor_id,
      doctorName: apt.doctor_name,
      appointmentDate: apt.appointment_date,
      appointmentTime: apt.appointment_time,
      reason: apt.reason,
      symptoms: apt.symptoms,
      status: apt.status,
      source: apt.source,
      notes: apt.notes,
      createdAt: apt.created_at,
      updatedAt: apt.updated_at,
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Failed to fetch appointment', error: error.message });
  }
});

// Create appointment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      patientName,
      patientEmail,
      patientPhone,
      appointmentDate,
      appointmentTime,
      reason,
      symptoms,
      status = 'pending',
      source = 'online',
      doctorId,
    } = req.body;

    let patientId = req.user.role === 'patient' ? req.user.id : null;
    const finalPatientName = patientName || req.user.name;

    if (req.user.role !== 'patient' && patientEmail) {
      const [patientLookup] = await pool.execute(
        'SELECT id FROM users WHERE email = ? LIMIT 1',
        [patientEmail]
      );

      if (patientLookup.length > 0) {
        patientId = patientLookup[0].id;
      } else {
        return res.status(400).json({ message: 'Patient email not found. Create/register the patient first, or use an existing patient email.' });
      }
    }

    // Check for double booking
    const [existingCheck] = await pool.execute(
      `SELECT id FROM appointments WHERE appointment_date = ? AND appointment_time = ? AND status != 'cancelled'`,
      [appointmentDate, appointmentTime]
    );

    if (existingCheck.length > 0) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Get doctor ID if not provided
    let finalDoctorId = doctorId;
    if (!finalDoctorId) {
      const [doctorResult] = await pool.execute(
        "SELECT id FROM users WHERE role = 'doctor' LIMIT 1"
      );
      if (doctorResult.length > 0) {
        finalDoctorId = doctorResult[0].id;
      }
    }

    const [result] = await pool.execute(
      `INSERT INTO appointments (patient_id, patient_name, patient_phone, doctor_id, appointment_date, appointment_time, reason, symptoms, status, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patientId, finalPatientName, patientPhone, finalDoctorId, appointmentDate, appointmentTime, reason, symptoms, status, source]
    );

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: {
        id: result.insertId,
        patientId,
        patientName: finalPatientName,
        patientPhone,
        doctorId: finalDoctorId,
        appointmentDate,
        appointmentTime,
        reason,
        symptoms,
        status,
        source,
      },
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Failed to create appointment', error: error.message });
  }
});

// Update appointment
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, notes, appointmentDate, appointmentTime, reason, symptoms } = req.body;

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }
    if (appointmentDate) {
      updates.push('appointment_date = ?');
      params.push(appointmentDate);
    }
    if (appointmentTime) {
      updates.push('appointment_time = ?');
      params.push(appointmentTime);
    }
    if (reason) {
      updates.push('reason = ?');
      params.push(reason);
    }
    if (symptoms !== undefined) {
      updates.push('symptoms = ?');
      params.push(symptoms);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    params.push(req.params.id);
    await pool.execute(`UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`, params);

    // Fetch updated appointment details
    const [rows] = await pool.execute(`
      SELECT
        a.*,
        COALESCE(u.email, '') as patient_email,
        COALESCE(u.phone, a.patient_phone) as patient_phone,
        COALESCE(u.name, a.patient_name) as patient_name,
        d.name as doctor_name
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN users d ON a.doctor_id = d.id
      WHERE a.id = ?
    `, [req.params.id]);
    const apt = rows[0];

    // Send notification if status is confirmed or date/time changed
    if (status === 'confirmed' || appointmentDate || appointmentTime) {
      const enableSMS = process.env.ENABLE_SMS_NOTIFICATIONS === 'true';
      const enableEmail = process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false';
      // Email
      if (enableEmail && apt.patient_email) {
        await sendAppointmentConfirmation(apt.patient_email, {
          patientName: apt.patient_name,
          appointmentDate: apt.appointment_date,
          appointmentTime: apt.appointment_time,
          reason: apt.reason,
          doctorName: apt.doctor_name,
        });
      }
      // SMS
      if (enableSMS && apt.patient_phone) {
        await sendAppointmentConfirmationSMS(apt.patient_phone, {
          patientName: apt.patient_name,
          appointmentDate: apt.appointment_date,
          appointmentTime: apt.appointment_time,
          doctorName: apt.doctor_name,
        });
      }
    }

    res.json({ message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Failed to update appointment', error: error.message });
  }
});

// Cancel appointment
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    await pool.execute(
      "UPDATE appointments SET status = 'cancelled' WHERE id = ?",
      [req.params.id]
    );

    const [rows] = await pool.execute(`
      SELECT
        a.*,
        COALESCE(u.email, '') as patient_email,
        COALESCE(u.phone, a.patient_phone) as patient_phone,
        COALESCE(u.name, a.patient_name) as patient_name,
        d.name as doctor_name
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN users d ON a.doctor_id = d.id
      WHERE a.id = ?
    `, [req.params.id]);

    const apt = rows[0];
    const enableSMS = process.env.ENABLE_SMS_NOTIFICATIONS === 'true';
    const enableEmail = process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false';

    if (enableEmail && apt?.patient_email) {
      await sendCancellationNotification(apt.patient_email, {
        patientName: apt.patient_name,
        appointmentDate: apt.appointment_date,
        appointmentTime: apt.appointment_time,
        reason: apt.reason,
        doctorName: apt.doctor_name,
      });
    }

    if (enableSMS && apt?.patient_phone) {
      await sendCancellationSMS(apt.patient_phone, {
        patientName: apt.patient_name,
        appointmentDate: apt.appointment_date,
        appointmentTime: apt.appointment_time,
        reason: apt.reason,
        doctorName: apt.doctor_name,
      });
    }

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Failed to cancel appointment', error: error.message });
  }
});

// Reschedule appointment
router.put('/:id/reschedule', authMiddleware, async (req, res) => {
  try {
    const { appointmentDate, appointmentTime } = req.body;

    // Check for double booking
    const [existingCheck] = await pool.execute(
      `SELECT id FROM appointments WHERE appointment_date = ? AND appointment_time = ? AND status != 'cancelled' AND id != ?`,
      [appointmentDate, appointmentTime, req.params.id]
    );

    if (existingCheck.length > 0) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    await pool.execute(
      "UPDATE appointments SET appointment_date = ?, appointment_time = ?, status = 'rescheduled' WHERE id = ?",
      [appointmentDate, appointmentTime, req.params.id]
    );

    const [rows] = await pool.execute(`
      SELECT
        a.*,
        COALESCE(u.email, '') as patient_email,
        COALESCE(u.phone, a.patient_phone) as patient_phone,
        COALESCE(u.name, a.patient_name) as patient_name,
        d.name as doctor_name
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN users d ON a.doctor_id = d.id
      WHERE a.id = ?
    `, [req.params.id]);

    const apt = rows[0];
    const enableSMS = process.env.ENABLE_SMS_NOTIFICATIONS === 'true';
    const enableEmail = process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false';

    if (enableEmail && apt?.patient_email) {
      await sendRescheduleNotification(apt.patient_email, {
        patientName: apt.patient_name,
        appointmentDate: apt.appointment_date,
        appointmentTime: apt.appointment_time,
        reason: apt.reason,
        doctorName: apt.doctor_name,
      });
    }

    if (enableSMS && apt?.patient_phone) {
      await sendRescheduleSMS(apt.patient_phone, {
        patientName: apt.patient_name,
        appointmentDate: apt.appointment_date,
        appointmentTime: apt.appointment_time,
        reason: apt.reason,
        doctorName: apt.doctor_name,
      });
    }

    res.json({ message: 'Appointment rescheduled successfully' });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({ message: 'Failed to reschedule appointment', error: error.message });
  }
});

// Patient accepts rescheduled appointment
router.put('/:id/accept', authMiddleware, async (req, res) => {
  try {
    // Update status to confirmed
    await pool.execute(
      "UPDATE appointments SET status = 'confirmed' WHERE id = ?",
      [req.params.id]
    );

    // Notify doctor that patient accepted
    const [rows] = await pool.execute(`
      SELECT
        a.*,
        COALESCE(u.name, a.patient_name) as patient_name,
        d.email as doctor_email,
        d.name as doctor_name
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN users d ON a.doctor_id = d.id
      WHERE a.id = ?
    `, [req.params.id]);

    const apt = rows[0];
    console.log(`Patient ${apt.patient_name} accepted rescheduled appointment for ${apt.appointment_date}`);

    res.json({ message: 'Appointment accepted successfully' });
  } catch (error) {
    console.error('Accept appointment error:', error);
    res.status(500).json({ message: 'Failed to accept appointment', error: error.message });
  }
});

// Patient declines rescheduled appointment
router.put('/:id/decline', authMiddleware, async (req, res) => {
  try {
    // Update status to cancelled
    await pool.execute(
      "UPDATE appointments SET status = 'cancelled' WHERE id = ?",
      [req.params.id]
    );

    // Log decline
    const [rows] = await pool.execute(`
      SELECT
        a.*,
        COALESCE(u.name, a.patient_name) as patient_name,
        d.email as doctor_email,
        d.name as doctor_name
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN users d ON a.doctor_id = d.id
      WHERE a.id = ?
    `, [req.params.id]);

    const apt = rows[0];
    console.log(`Patient ${apt.patient_name} declined rescheduled appointment for ${apt.appointment_date}`);

    res.json({ message: 'Appointment declined' });
  } catch (error) {
    console.error('Decline appointment error:', error);
    res.status(500).json({ message: 'Failed to decline appointment', error: error.message });
  }
});

// Delete appointment
router.delete('/:id', authMiddleware, authorize('admin', 'doctor'), async (req, res) => {
  try {
    await pool.execute('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Failed to delete appointment', error: error.message });
  }
});

// Get available time slots for a date
router.get('/slots/:date', authMiddleware, async (req, res) => {
  try {
    const { date } = req.params;
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // Get doctor availability for this day
    const [availability] = await pool.execute(
      `SELECT start_time, end_time FROM doctor_availability WHERE day_of_week = ? AND is_available = 1`,
      [dayOfWeek]
    );

    if (availability.length === 0) {
      return res.json({ slots: [], message: 'No availability on this day' });
    }

    // Get booked appointments
    const [bookedAppts] = await pool.execute(
      `SELECT appointment_time FROM appointments WHERE appointment_date = ? AND status != 'cancelled'`,
      [date]
    );

    // Get blocked slots
    const [blockedSlots] = await pool.execute(
      `SELECT start_time, end_time FROM blocked_slots WHERE blocked_date = ?`,
      [date]
    );

    // Generate available slots (30-minute intervals)
    const slots = [];
    const bookedTimes = bookedAppts.map((apt) => apt.appointment_time);

    for (const avail of availability) {
      let currentTime = new Date(`2000-01-01 ${avail.start_time}`);
      const endTime = new Date(`2000-01-01 ${avail.end_time}`);

      while (currentTime < endTime) {
        const timeStr = currentTime.toTimeString().slice(0, 5);
        const isBooked = bookedTimes.some(t => t && t.toString().includes(timeStr));
        const isBlocked = blockedSlots.some((block) => {
          const blockStart = new Date(`2000-01-01 ${block.start_time}`);
          const blockEnd = new Date(`2000-01-01 ${block.end_time}`);
          return currentTime >= blockStart && currentTime < blockEnd;
        });

        if (!isBooked && !isBlocked) {
          slots.push(timeStr);
        }

        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }
    }

    res.json({ slots });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ message: 'Failed to fetch available slots', error: error.message });
  }
});

module.exports = router;
