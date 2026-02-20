const express = require('express');
const { pool } = require('../config/database');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();

// Get appointment statistics
router.get('/stats', authMiddleware, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params = [];
    if (startDate && endDate) {
      dateFilter = 'WHERE appointment_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Total appointments
    const [totalResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM appointments ${dateFilter}`,
      params
    );

    // Appointments by status
    const [statusResult] = await pool.execute(
      `SELECT status, COUNT(*) as count FROM appointments ${dateFilter} GROUP BY status`,
      params
    );

    // Appointments by source
    const [sourceResult] = await pool.execute(
      `SELECT source, COUNT(*) as count FROM appointments ${dateFilter} GROUP BY source`,
      params
    );

    // Daily appointments
    const [dailyResult] = await pool.execute(
      `SELECT DATE(appointment_date) as date, COUNT(*) as count 
       FROM appointments ${dateFilter} 
       GROUP BY DATE(appointment_date) 
       ORDER BY date DESC
       LIMIT 30`,
      params
    );

    // Common reasons
    const [reasonsResult] = await pool.execute(
      `SELECT reason, COUNT(*) as count 
       FROM appointments ${dateFilter} 
       GROUP BY reason 
       ORDER BY count DESC
       LIMIT 10`,
      params
    );

    res.json({
      total: totalResult[0].total,
      byStatus: statusResult.reduce((acc, row) => {
        acc[row.status] = row.count;
        return acc;
      }, {}),
      bySource: sourceResult.reduce((acc, row) => {
        acc[row.source] = row.count;
        return acc;
      }, {}),
      daily: dailyResult.map((row) => ({
        date: row.date,
        count: row.count,
      })),
      commonReasons: reasonsResult.map((row) => ({
        reason: row.reason,
        count: row.count,
      })),
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
});

// Get patient statistics
router.get('/patients', authMiddleware, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const [totalResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM users WHERE role = 'patient'"
    );

    const [newPatientsResult] = await pool.execute(
      `SELECT COUNT(*) as count FROM users WHERE role = 'patient' AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`
    );

    const [activeResult] = await pool.execute(
      'SELECT COUNT(DISTINCT patient_id) as count FROM appointments'
    );

    const [monthlyResult] = await pool.execute(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
       FROM users WHERE role = 'patient' 
       GROUP BY DATE_FORMAT(created_at, '%Y-%m') 
       ORDER BY month DESC
       LIMIT 12`
    );

    res.json({
      total: totalResult[0].total,
      newThisMonth: newPatientsResult[0].count,
      active: activeResult[0].count,
      monthly: monthlyResult.map((row) => ({
        month: row.month,
        count: row.count,
      })),
    });
  } catch (error) {
    console.error('Get patient stats error:', error);
    res.status(500).json({ message: 'Failed to fetch patient statistics', error: error.message });
  }
});

// Generate appointment report
router.get('/appointments', authMiddleware, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { startDate, endDate, status, source } = req.query;

    let query = `
      SELECT a.*, u.name as patient_name, u.phone as patient_phone, u.email as patient_email, d.name as doctor_name
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN users d ON a.doctor_id = d.id
      WHERE 1=1
    `;

    const params = [];

    if (startDate && endDate) {
      query += ' AND a.appointment_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    if (source) {
      query += ' AND a.source = ?';
      params.push(source);
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const [rows] = await pool.execute(query, params);

    res.json({
      count: rows.length,
      appointments: rows.map((apt) => ({
        id: apt.id,
        patientName: apt.patient_name,
        patientPhone: apt.patient_phone,
        patientEmail: apt.patient_email,
        doctorName: apt.doctor_name,
        appointmentDate: apt.appointment_date,
        appointmentTime: apt.appointment_time,
        reason: apt.reason,
        symptoms: apt.symptoms,
        status: apt.status,
        source: apt.source,
        notes: apt.notes,
        createdAt: apt.created_at,
      })),
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ message: 'Failed to generate report', error: error.message });
  }
});

// Get doctor workload report
router.get('/doctor-workload', authMiddleware, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params = [];
    if (startDate && endDate) {
      dateFilter = 'AND a.appointment_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const [rows] = await pool.execute(`
      SELECT 
        d.id,
        d.name as doctor_name,
        COUNT(a.id) as total_appointments,
        SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN a.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN a.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed
      FROM users d
      LEFT JOIN appointments a ON d.id = a.doctor_id ${dateFilter}
      WHERE d.role = 'doctor'
      GROUP BY d.id, d.name
    `, params);

    res.json({
      doctors: rows.map((doc) => ({
        id: doc.id,
        name: doc.doctor_name,
        totalAppointments: doc.total_appointments,
        completed: doc.completed,
        cancelled: doc.cancelled,
        pending: doc.pending,
        confirmed: doc.confirmed,
      })),
    });
  } catch (error) {
    console.error('Get workload error:', error);
    res.status(500).json({ message: 'Failed to fetch workload report', error: error.message });
  }
});

module.exports = router;
