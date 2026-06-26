# GynoConnect - Hospital Appointment Scheduling System
## Project Documentation for Panel Presentation

---

## 1. PROJECT OVERVIEW

### 1.1 Project Title
**GynoConnect** - A Web-Based Hospital Appointment Scheduling System for Gynecology Clinics

### 1.2 Problem Statement
Traditional hospital appointment booking relies on phone calls and physical visits, leading to:
- Long waiting times for patients
- Double bookings and scheduling conflicts
- Missed appointments due to lack of reminders
- Difficulty for doctors to manage their schedules
- No centralized system for appointment tracking

### 1.3 Solution
GynoConnect is a full-stack web application that enables:
- Patients to book appointments online 24/7
- Doctors to manage their schedules and confirm/reschedule appointments
- Automated email and SMS notifications for reminders
- Admin oversight of the entire appointment system
- Real-time status tracking of appointments

### 1.4 Target Users
1. **Patients** - Women seeking gynecological healthcare services
2. **Doctors** - Gynecologists and specialists
3. **Administrators** - Hospital staff managing the system

---

## 2. TECHNOLOGIES USED

### 2.1 Frontend (Client-Side)
| Technology | Version | Purpose |
|------------|---------|---------|
| React.js | 19.x | UI component library |
| Vite | 7.3.1 | Build tool and dev server |
| Tailwind CSS | 4.x | Utility-first CSS framework |
| React Router | 7.x | Client-side routing |
| Axios | - | HTTP client for API calls |
| Context API | - | State management (Authentication) |

### 2.2 Backend (Server-Side)
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 24.x | JavaScript runtime |
| Express.js | 4.x | Web application framework |
| MySQL | 8.x | Relational database |
| mysql2 | - | MySQL driver for Node.js |
| JWT | - | JSON Web Tokens for authentication |
| bcryptjs | - | Password hashing |
| nodemailer | - | Email sending |
| node-cron | - | Scheduled tasks (reminders) |

### 2.3 External APIs/Services
| Service | Purpose |
|---------|---------|
| Gmail SMTP | Email notifications |
| Africa's Talking | SMS notifications (Kenya) |

---

## 3. SYSTEM ARCHITECTURE

### 3.1 Architecture Pattern
**Three-Tier Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│              (React.js + Tailwind CSS)                       │
│         Frontend running on http://localhost:5173            │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│                (Node.js + Express.js)                        │
│          Backend API on http://localhost:5000                │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Routes    │  │ Middleware  │  │     Services        │  │
│  │ - auth      │  │ - auth.js   │  │ - emailService      │  │
│  │ - appoint.  │  │ (JWT verify)│  │ - smsService        │  │
│  │ - doctors   │  │             │  │ - reminderScheduler │  │
│  │ - users     │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SQL Queries
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│                    (MySQL Database)                          │
│                                                              │
│  Tables: users, appointments, doctor_availability,          │
│          blocked_slots, notifications                        │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Authentication Flow
```
1. User submits login credentials
2. Backend validates against database (bcrypt compare)
3. If valid, JWT token generated and returned
4. Frontend stores token in localStorage
5. All subsequent requests include token in Authorization header
6. Middleware verifies token on protected routes
```

---

## 4. PROJECT STRUCTURE EXPLAINED

### 4.1 Root Directory
```
Final project/
├── backend/                 # Server-side code
├── frontend/                # Client-side code
├── .gitignore              # Files to exclude from Git
└── PROJECT_DOCUMENTATION.md # This file
```

### 4.2 Backend Structure

```
backend/
├── config/
│   ├── database.js         # MySQL connection pool configuration
│   └── init-db.sql         # SQL script to create database tables
│
├── middleware/
│   └── auth.js             # JWT authentication middleware
│                           # - authMiddleware: Verifies JWT tokens
│                           # - authorize: Role-based access control
│
├── migrations/
│   ├── add_doctor_fields.sql      # Adds specialty, profile_image columns
│   ├── add_rescheduled_status.js  # Adds 'rescheduled' to status ENUM
│   └── create_notifications_table.sql
│
├── routes/
│   ├── appointments.js     # Appointment CRUD operations
│   │                       # POST /    - Create appointment
│   │                       # GET /     - Get appointments (filtered by role)
│   │                       # PUT /:id/confirm - Doctor confirms
│   │                       # PUT /:id/cancel  - Cancel appointment
│   │                       # PUT /:id/reschedule - Doctor reschedules
│   │                       # PUT /:id/accept  - Patient accepts reschedule
│   │                       # PUT /:id/decline - Patient declines
│   │
│   ├── auth.js             # Authentication routes
│   │                       # POST /register - User registration
│   │                       # POST /login    - User login
│   │                       # GET /me        - Get current user
│   │
│   ├── doctors.js          # Doctor management
│   │                       # GET /          - List all doctors
│   │                       # GET /:id/schedule - Doctor's schedule
│   │                       # PUT /:id/availability - Update availability
│   │
│   ├── notifications.js    # Notification settings
│   ├── reports.js          # Admin reports and analytics
│   └── users.js            # User profile management
│
├── services/
│   ├── emailService.js     # Nodemailer configuration
│   │                       # - sendAppointmentConfirmation()
│   │                       # - sendCancellationNotification()
│   │                       # - sendRescheduleNotification()
│   │                       # - sendReminder()
│   │
│   ├── smsService.js       # Africa's Talking SMS integration
│   │                       # - sendAppointmentConfirmationSMS()
│   │                       # - sendCancellationSMS()
│   │                       # - sendRescheduleSMS()
│   │                       # - sendReminderSMS()
│   │
│   └── reminderScheduler.js # Automated reminders using node-cron
│                            # - Runs every 15 minutes
│                            # - Sends 24-hour reminders
│                            # - Sends same-day reminders
│
├── uploads/
│   └── doctors/            # Doctor profile images
│
├── .env                    # Environment variables (NOT in Git)
├── .env.example            # Template for environment variables
├── package.json            # Node.js dependencies
├── server.js               # Main entry point - Express app setup
└── README.md               # Setup instructions
```

### 4.3 Frontend Structure

```
frontend/
├── public/                 # Static assets
│
├── src/
│   ├── assets/            # Images, icons, etc.
│   │
│   ├── components/        # Reusable UI components
│   │   ├── Navbar.jsx     # Navigation bar with role-based menu
│   │   ├── Footer.jsx     # Page footer
│   │   └── ProtectedRoute.jsx  # Route guard for authentication
│   │
│   ├── context/
│   │   └── AuthContext.jsx # React Context for authentication state
│   │                       # - user: Current logged-in user
│   │                       # - login(): Set user and token
│   │                       # - logout(): Clear user session
│   │                       # - isAuthenticated: Boolean check
│   │
│   ├── pages/
│   │   ├── LandingPage.jsx      # Public homepage
│   │   ├── Login.jsx            # Login form
│   │   ├── Register.jsx         # Registration form
│   │   ├── AboutUs.jsx          # About the clinic
│   │   │
│   │   ├── PatientDashboard.jsx # Patient's main interface
│   │   │                        # - Book new appointments
│   │   │                        # - View upcoming appointments
│   │   │                        # - Accept/Decline rescheduled
│   │   │                        # - View appointment history
│   │   │
│   │   ├── DoctorDashboard.jsx  # Doctor's main interface
│   │   │                        # - View assigned appointments
│   │   │                        # - Confirm/Cancel/Reschedule
│   │   │                        # - Update availability
│   │   │
│   │   ├── AdminDashboard.jsx   # Admin's main interface
│   │   │                        # - Overview statistics
│   │   │                        # - Manage doctors
│   │   │                        # - View all appointments
│   │   │
│   │   ├── admin/               # Admin sub-pages
│   │   │   ├── AdminSidebar.jsx
│   │   │   ├── DashboardTab.jsx
│   │   │   ├── DoctorsTab.jsx
│   │   │   └── AppointmentsTab.jsx
│   │   │
│   │   ├── AppointmentHistory.jsx
│   │   ├── Calendar.jsx         # Calendar view
│   │   ├── NotificationManagement.jsx
│   │   ├── PatientProfile.jsx
│   │   └── Reports.jsx          # Analytics and reports
│   │
│   ├── services/
│   │   └── api.js              # Axios instance and API methods
│   │                           # - appointmentService
│   │                           # - doctorService
│   │                           # - authService
│   │                           # - userService
│   │
│   ├── App.jsx                 # Main app with React Router
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles + Tailwind imports
│
├── index.html                  # HTML template
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── eslint.config.js            # Code linting rules
```

---

## 5. DATABASE SCHEMA

### 5.1 Entity Relationship Diagram (ERD)
```
┌──────────────────┐       ┌──────────────────────┐
│      USERS       │       │   DOCTOR_AVAILABILITY │
├──────────────────┤       ├──────────────────────┤
│ id (PK)          │───┐   │ id (PK)              │
│ name             │   │   │ doctor_id (FK)───────┼───┐
│ email            │   │   │ day_of_week          │   │
│ password         │   │   │ start_time           │   │
│ role             │   │   │ end_time             │   │
│ phone            │   │   │ is_available         │   │
│ specialty        │   │   └──────────────────────┘   │
│ profile_image    │   │                              │
│ is_featured      │   │   ┌──────────────────────┐   │
│ created_at       │   │   │    BLOCKED_SLOTS     │   │
└──────────────────┘   │   ├──────────────────────┤   │
         │             │   │ id (PK)              │   │
         │             │   │ doctor_id (FK)───────┼───┤
         │             │   │ blocked_date         │   │
         ▼             │   │ start_time           │   │
┌──────────────────┐   │   │ end_time             │   │
│   APPOINTMENTS   │   │   │ reason               │   │
├──────────────────┤   │   └──────────────────────┘   │
│ id (PK)          │   │                              │
│ patient_id (FK)──┼───┤                              │
│ doctor_id (FK)───┼───┴──────────────────────────────┘
│ appointment_date │
│ appointment_time │
│ reason           │
│ symptoms         │
│ status           │
│ created_at       │
└──────────────────┘
         │
         ▼
┌──────────────────┐
│  NOTIFICATIONS   │
├──────────────────┤
│ id (PK)          │
│ user_id (FK)     │
│ appointment_id   │
│ type             │
│ channel          │
│ status           │
│ sent_at          │
└──────────────────┘
```

### 5.2 User Roles and Permissions
| Role | Permissions |
|------|-------------|
| **Patient** | Book appointments, view own appointments, accept/decline reschedules, update profile |
| **Doctor** | View assigned appointments, confirm/cancel/reschedule appointments, update availability |
| **Admin** | View all appointments, manage doctors, view reports, manage users |

### 5.3 Appointment Status Flow
```
                    ┌─────────────┐
                    │   PENDING   │ ← Patient books
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌──────────┐  ┌───────────┐  ┌──────────┐
       │CONFIRMED │  │RESCHEDULED│  │CANCELLED │
       └────┬─────┘  └─────┬─────┘  └──────────┘
            │              │
            │         ┌────┴────┐
            │         ▼         ▼
            │    ┌─────────┐ ┌──────────┐
            │    │CONFIRMED│ │CANCELLED │
            │    └────┬────┘ └──────────┘
            │         │
            └────┬────┘
                 ▼
          ┌───────────┐
          │ COMPLETED │
          └───────────┘
```

---

## 6. KEY FEATURES EXPLAINED

### 6.1 Authentication System
**How it works:**
1. User registers with email, password, name, phone
2. Password is hashed using bcrypt (10 salt rounds)
3. On login, password is compared with stored hash
4. JWT token is generated with user ID and role
5. Token expires in 7 days (configurable)

**Code location:** `backend/routes/auth.js`, `backend/middleware/auth.js`

### 6.2 Appointment Booking
**Process:**
1. Patient selects a doctor from the list
2. Patient chooses date and time
3. System checks for conflicts (no double booking)
4. Appointment created with "pending" status
5. Confirmation email/SMS sent to patient

**Code location:** `backend/routes/appointments.js`, `frontend/src/pages/PatientDashboard.jsx`

### 6.3 Doctor Reschedule Flow
**Process:**
1. Doctor sees pending appointment
2. Doctor clicks "Reschedule" and sets new date/time
3. Status changes to "rescheduled"
4. Patient receives email/SMS notification
5. Patient sees "Accept" or "Decline" buttons
6. If accepted → status becomes "confirmed"
7. If declined → status becomes "cancelled"

**Code location:** `backend/routes/appointments.js` (reschedule, accept, decline endpoints)

### 6.4 Automated Reminders
**Schedule:**
- Every 15 minutes, system checks for upcoming appointments
- 24-hour reminder: Sent day before appointment
- Same-day reminder: Sent morning of appointment

**Code location:** `backend/services/reminderScheduler.js`

### 6.5 SMS Integration (Africa's Talking)
**Why Africa's Talking?**
- Popular SMS gateway in Kenya/Africa
- Cost-effective for local numbers
- Easy API integration

**Code location:** `backend/services/smsService.js`

---

## 7. POTENTIAL PANEL QUESTIONS AND ANSWERS

### Q1: Why did you choose React.js for the frontend?
**Answer:** 
- React is component-based, making code reusable and maintainable
- Virtual DOM ensures efficient UI updates
- Large ecosystem with many libraries
- Industry standard used by companies like Facebook, Netflix
- Easy state management with Context API

### Q2: Why MySQL instead of MongoDB?
**Answer:**
- Appointment systems need ACID transactions (data integrity)
- Clear relationships between users, doctors, and appointments
- Structured data (appointments have fixed fields like date, time, status)
- SQL is better for complex queries like "find all appointments for Dr. X on date Y"
- Hospital data requires consistency and reliability

### Q3: How do you handle security?
**Answer:**
- Passwords are hashed using bcrypt (never stored in plain text)
- JWT tokens for authenticated sessions
- Authorization middleware checks user roles before accessing resources
- Environment variables store sensitive data (not in code)
- CORS configured to allow only frontend origin

### Q4: What happens if two patients try to book the same time slot?
**Answer:**
- Before creating an appointment, the system checks for conflicts
- SQL query checks: `SELECT * FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'`
- If a conflict exists, it returns error 400: "This time slot is already booked"
- This prevents double booking

### Q5: How does the reminder system work?
**Answer:**
- Node-cron runs scheduled tasks every 15 minutes
- It queries appointments happening in the next 24 hours
- Filters out those already notified (using notifications table)
- Sends email via Nodemailer and SMS via Africa's Talking
- Records notification in database to prevent duplicates

### Q6: How would you scale this system for a larger hospital?
**Answer:**
- Add load balancer for multiple backend instances
- Use Redis for session management and caching
- Move to a managed database like AWS RDS
- Implement message queues (RabbitMQ) for notifications
- Add rate limiting to prevent abuse
- Implement horizontal scaling with Docker/Kubernetes

### Q7: What were the main challenges you faced?
**Answer:**
- Integrating SMS service (Africa's Talking) - required phone number formatting for Kenya
- Handling timezone differences for appointments
- Implementing the reschedule-accept-decline flow
- Making the UI responsive for mobile devices
- Setting up Gmail SMTP (required App Passwords, not regular password)

### Q8: How do you ensure data integrity?
**Answer:**
- Foreign keys in database ensure referential integrity
- Status ENUM restricts values to valid options only
- Transactions for critical operations
- Validation on both frontend and backend
- Unique constraints on email to prevent duplicate accounts

### Q9: What testing did you perform?
**Answer:**
- Manual testing of all user flows
- Testing different user roles (patient, doctor, admin)
- API testing using Postman
- Cross-browser testing (Chrome, Firefox, Edge)
- Mobile responsiveness testing

### Q10: What future improvements would you add?
**Answer:**
- Video consultation integration (telemedicine)
- Payment gateway for appointment fees
- Mobile app (React Native)
- AI chatbot for common queries
- Report generation (PDF export)
- Multi-language support
- Integration with hospital management systems

---

## 8. HOW TO DEMONSTRATE THE SYSTEM

### 8.1 Demo Flow
1. **Show Landing Page** - Explain the public-facing site
2. **Register as Patient** - Show registration process
3. **Book Appointment** - Select doctor, date, time
4. **Login as Doctor** - Show doctor dashboard
5. **Reschedule Appointment** - Doctor changes date
6. **Login as Patient** - Show Accept/Decline buttons
7. **Login as Admin** - Show overview and management
8. **Show Email** - Open Gmail to show notification received
9. **Show Code Structure** - Brief walkthrough of key files

### 8.2 Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | scoviachepkemoi906@gmail.com | admin123 |
| Doctor | drwanjiru@gynoconnect.com | doctor123 |
| Patient | (Create new during demo) | - |

---

## 9. GLOSSARY

| Term | Definition |
|------|------------|
| **API** | Application Programming Interface - how frontend communicates with backend |
| **JWT** | JSON Web Token - secure way to transmit user identity |
| **CRUD** | Create, Read, Update, Delete - basic database operations |
| **REST** | Representational State Transfer - API design pattern |
| **CORS** | Cross-Origin Resource Sharing - security feature for web requests |
| **bcrypt** | Password hashing algorithm |
| **SMTP** | Simple Mail Transfer Protocol - for sending emails |
| **ORM** | Object-Relational Mapping (we use raw SQL queries instead) |

---

## 10. REFERENCES

1. React.js Documentation - https://react.dev/
2. Express.js Documentation - https://expressjs.com/
3. MySQL Documentation - https://dev.mysql.com/doc/
4. Tailwind CSS - https://tailwindcss.com/
5. Africa's Talking API - https://africastalking.com/
6. Nodemailer - https://nodemailer.com/
7. JWT.io - https://jwt.io/

---

*Document prepared for GynoConnect Project Presentation*
*Last Updated: February 2026*
