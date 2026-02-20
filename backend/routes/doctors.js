const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/doctors');
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'doctor-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// PUBLIC: Get featured doctors for landing page (no auth required)
router.get('/featured', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, name, specialty, profile_image, is_featured
      FROM users 
      WHERE role = 'doctor' AND is_featured = 1
      ORDER BY name
      LIMIT 10
    `);
    
    res.json(rows.map(doc => ({
      id: doc.id,
      name: doc.name,
      specialty: doc.specialty || 'General Practitioner',
      profileImage: doc.profile_image,
      available: true
    })));
  } catch (error) {
    console.error('Get featured doctors error:', error);
    res.status(500).json({ message: 'Failed to fetch featured doctors', error: error.message });
  }
});

// Get all doctors
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, phone, specialty, profile_image, is_featured FROM users WHERE role = 'doctor'"
    );
    res.json(rows.map(doc => ({
      id: doc.id,
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      specialty: doc.specialty || 'General Practitioner',
      profileImage: doc.profile_image,
      isFeatured: doc.is_featured || false
    })));
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Failed to fetch doctors', error: error.message });
  }
});

// Upload doctor profile image (admin only)
router.post('/:doctorId/image', authMiddleware, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imageUrl = `/uploads/doctors/${req.file.filename}`;
    
    await pool.execute(
      "UPDATE users SET profile_image = ? WHERE id = ? AND role = 'doctor'",
      [imageUrl, req.params.doctorId]
    );
    
    res.json({ message: 'Profile image uploaded successfully', imageUrl });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
});

// Update doctor details (admin only)
router.put('/:doctorId', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const { specialty, isFeatured } = req.body;
    
    await pool.execute(
      "UPDATE users SET specialty = ?, is_featured = ? WHERE id = ? AND role = 'doctor'",
      [specialty, isFeatured ? 1 : 0, req.params.doctorId]
    );
    
    res.json({ message: 'Doctor updated successfully' });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ message: 'Failed to update doctor', error: error.message });
  }
});

// Get doctor schedule/availability
router.get('/:doctorId/schedule', authMiddleware, async (req, res) => {
  try {
    const [availability] = await pool.execute(
      'SELECT * FROM doctor_availability WHERE doctor_id = ?',
      [req.params.doctorId]
    );

    const [blockedSlots] = await pool.execute(
      'SELECT * FROM blocked_slots WHERE doctor_id = ? AND blocked_date >= CURDATE()',
      [req.params.doctorId]
    );

    res.json({
      availability: availability.map((a) => ({
        id: a.id,
        doctorId: a.doctor_id,
        dayOfWeek: a.day_of_week,
        startTime: a.start_time,
        endTime: a.end_time,
        isAvailable: a.is_available,
      })),
      blockedSlots: blockedSlots.map((b) => ({
        id: b.id,
        doctorId: b.doctor_id,
        blockedDate: b.blocked_date,
        startTime: b.start_time,
        endTime: b.end_time,
        reason: b.reason,
      })),
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ message: 'Failed to fetch schedule', error: error.message });
  }
});

// Update doctor availability
router.put('/:doctorId/availability', authMiddleware, authorize('doctor'), async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, type, date, reason } = req.body;

    if (type === 'blocked') {
      await pool.execute(
        'INSERT INTO blocked_slots (doctor_id, blocked_date, start_time, end_time, reason) VALUES (?, ?, ?, ?, ?)',
        [req.params.doctorId, date, startTime, endTime, reason]
      );
      return res.json({ message: 'Time slot blocked successfully' });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM doctor_availability WHERE doctor_id = ? AND day_of_week = ?',
      [req.params.doctorId, dayOfWeek]
    );

    if (existing.length > 0) {
      await pool.execute(
        'UPDATE doctor_availability SET start_time = ?, end_time = ? WHERE id = ?',
        [startTime, endTime, existing[0].id]
      );
    } else {
      await pool.execute(
        'INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
        [req.params.doctorId, dayOfWeek, startTime, endTime]
      );
    }

    res.json({ message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Failed to update availability', error: error.message });
  }
});

// Get doctor appointments
router.get('/:doctorId/appointments', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT a.*, u.name as patient_name, u.phone as patient_phone
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      WHERE a.doctor_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `, [req.params.doctorId]);

    res.json(rows.map((apt) => ({
      id: apt.id,
      patientId: apt.patient_id,
      patientName: apt.patient_name,
      patientPhone: apt.patient_phone,
      appointmentDate: apt.appointment_date,
      appointmentTime: apt.appointment_time,
      reason: apt.reason,
      symptoms: apt.symptoms,
      status: apt.status,
      source: apt.source,
      notes: apt.notes,
    })));
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
});

// Remove blocked slot
router.delete('/:doctorId/blocked/:blockId', authMiddleware, authorize('doctor'), async (req, res) => {
  try {
    await pool.execute(
      'DELETE FROM blocked_slots WHERE id = ? AND doctor_id = ?',
      [req.params.blockId, req.params.doctorId]
    );
    res.json({ message: 'Blocked slot removed successfully' });
  } catch (error) {
    console.error('Remove blocked slot error:', error);
    res.status(500).json({ message: 'Failed to remove blocked slot', error: error.message });
  }
});

module.exports = router;
