const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const doctorRoutes = require('./routes/doctors');
const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');
const notificationRoutes = require('./routes/notifications');

// Import reminder scheduler
const { initializeReminderScheduler } = require('./services/reminderScheduler');

// Import database connection
const { pool, poolPromise } = require('./config/database');

const app = express();

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://gynoconnect-1.onrender.com',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test database connection (handled in database.js)

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Hospital Appointment API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

async function seedDefaultUsers() {
  try {
    const defaultPassword = 'demo123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const seededUsers = [
      {
        name: 'John Patient',
        email: 'patient@example.com',
        password: hashedPassword,
        role: 'patient',
        phone: '0712345678',
        specialty: null,
        isFeatured: false,
        profileImage: null,
      },
      {
        name: 'Jane Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        phone: '0723456789',
        specialty: null,
        isFeatured: false,
        profileImage: null,
      },
      {
        name: 'Dr. Alex Morgan',
        email: 'doctor@example.com',
        password: hashedPassword,
        role: 'doctor',
        phone: '0734567890',
        specialty: 'Gynecology',
        isFeatured: true,
        profileImage: '/uploads/doctors/doctor-1770741639473-909033715.png',
      },
      {
        name: 'Dr. Sarah Langat',
        email: 'sarahlangat@gmail.com',
        password: hashedPassword,
        role: 'doctor',
        phone: '0712345678',
        specialty: 'Gynecology',
        isFeatured: true,
        profileImage: '/uploads/doctors/doctor-1770741639473-909033715.png',
      },
      {
        name: 'Dr. Dominic Kipkorir',
        email: 'dominickipkorir@gmail.com',
        password: hashedPassword,
        role: 'doctor',
        phone: '0723456789',
        specialty: 'Obstetrics',
        isFeatured: true,
        profileImage: '/uploads/doctors/doctor-1770741655353-470129534.png',
      },
      {
        name: 'Dr. Teddy Ochieng',
        email: 'teddyochieng@gmail.com',
        password: hashedPassword,
        role: 'doctor',
        phone: '0734567890',
        specialty: 'Pediatrics',
        isFeatured: true,
        profileImage: '/uploads/doctors/doctor-1770741666703-796838445.png',
      },
    ];

    for (const user of seededUsers) {
      await pool.execute(
        `INSERT INTO users (name, email, password, role, phone, specialty, is_featured, profile_image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           password = EXCLUDED.password,
           role = EXCLUDED.role,
           phone = EXCLUDED.phone,
           specialty = EXCLUDED.specialty,
           is_featured = EXCLUDED.is_featured,
           profile_image = EXCLUDED.profile_image`,
        [
          user.name,
          user.email,
          user.password,
          user.role,
          user.phone,
          user.specialty,
          user.isFeatured,
          user.profileImage,
        ]
      );
    }

    console.log('Default users verified');
  } catch (error) {
    console.error('Default users seeding failed:', error.message);
  }
}

const PORT = process.env.PORT || 5000;

seedDefaultUsers().catch((error) => {
  console.error('Initial user seeding failed:', error.message);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize reminder scheduler for automated notifications
  initializeReminderScheduler();
  console.log(' Reminder scheduler initialized');
});
