# GynoConnect - Hospital Appointment System

A comprehensive hospital appointment scheduling system built with Node.js, Express, MySQL, and React.

## Features

- **Patient Portal**: Book appointments, view history, accept/decline rescheduled appointments
- **Doctor Dashboard**: Manage appointments, confirm/cancel/reschedule patient bookings
- **Admin Panel**: Oversee all appointments, manage doctors and users, generate reports
- **Notifications**: Email and SMS reminders (24-hour and same-day)
- **Real-time Status**: Track appointment status (pending, confirmed, rescheduled, cancelled)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Harshpal01/Gynoconnect.git
cd Gynoconnect
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Open `.env` in a text editor and configure:

```env
# REQUIRED - Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD    # <-- Change this to your MySQL password
DB_NAME=hospital_appointments

# REQUIRED - JWT Secret (any random string)
JWT_SECRET=your_secret_key_here

# OPTIONAL - Email Notifications (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password       # Use Gmail App Password, NOT your regular password

# OPTIONAL - SMS Notifications (Africa's Talking)
AT_USERNAME=your_username
AT_API_KEY=your_api_key
ENABLE_SMS_NOTIFICATIONS=false     # Set to 'true' to enable
```

#### How to Get Gmail App Password:
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication
3. Go to "App Passwords"
4. Generate a new app password for "Mail"
5. Use that 16-character password in `EMAIL_PASS`

### 4. Setup Database

**Option A: Using Command Line**
```bash
mysql -u root -p < config/init-db.sql
```

**Option B: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to your MySQL server
3. File → Open SQL Script → Select `backend/config/init-db.sql`
4. Execute the script

**Run Migrations:**
```bash
cd backend
node migrations/add_rescheduled_status.js
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Server runs at: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
App runs at: `http://localhost:5173`

---

## Default Login Credentials

| Role    | Email                          | Password   |
|---------|--------------------------------|------------|
| Admin   | scoviachepkemoi906@gmail.com   | admin123   |
| Doctor  | drwanjiru@gynoconnect.com      | doctor123  |
| Doctor  | drkamau@gynoconnect.com        | doctor123  |
| Doctor  | drachieng@gynoconnect.com      | doctor123  |
| Patient | (Register a new account)       | -          |

---

## Project Structure

```
├── backend/
│   ├── config/
│   │   ├── database.js          # MySQL connection pool
│   │   └── init-db.sql          # Database schema
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── migrations/              # Database migrations
│   ├── routes/
│   │   ├── appointments.js      # Appointment CRUD
│   │   ├── auth.js              # Login/Register
│   │   ├── doctors.js           # Doctor management
│   │   ├── notifications.js     # Notification settings
│   │   ├── reports.js           # Admin reports
│   │   └── users.js             # User management
│   ├── services/
│   │   ├── emailService.js      # Email notifications
│   │   ├── smsService.js        # SMS via Africa's Talking
│   │   └── reminderScheduler.js # Automated reminders
│   ├── .env.example             # Environment template
│   ├── package.json
│   └── server.js                # Express app entry
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── context/             # React Context (Auth)
│   │   ├── pages/               # Page components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── PatientDashboard.jsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js           # Axios API client
│   │   └── App.jsx              # Main app with routing
│   ├── package.json
│   └── vite.config.js
```

---

## API Endpoints

### Authentication
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| POST   | /api/auth/register  | Register new user    |
| POST   | /api/auth/login     | Login user           |
| GET    | /api/auth/me        | Get current user     |

### Appointments
| Method | Endpoint                        | Description                    |
|--------|---------------------------------|--------------------------------|
| GET    | /api/appointments               | Get appointments (by role)     |
| POST   | /api/appointments               | Create new appointment         |
| PUT    | /api/appointments/:id           | Update appointment             |
| PUT    | /api/appointments/:id/confirm   | Doctor confirms appointment    |
| PUT    | /api/appointments/:id/cancel    | Cancel appointment             |
| PUT    | /api/appointments/:id/reschedule| Doctor reschedules appointment |
| PUT    | /api/appointments/:id/accept    | Patient accepts reschedule     |
| PUT    | /api/appointments/:id/decline   | Patient declines reschedule    |

### Doctors
| Method | Endpoint                       | Description              |
|--------|--------------------------------|--------------------------|
| GET    | /api/doctors                   | Get all doctors          |
| GET    | /api/doctors/:id/schedule      | Get doctor's schedule    |
| PUT    | /api/doctors/:id/availability  | Update availability      |

### Users
| Method | Endpoint           | Description              |
|--------|--------------------|--------------------------|
| GET    | /api/users/profile | Get user profile         |
| PUT    | /api/users/profile | Update user profile      |
| GET    | /api/users         | Get all users (admin)    |

---

## Troubleshooting

### Database Connection Error
```
Error: Access denied for user 'root'@'localhost'
```
**Solution:** Check your `DB_PASSWORD` in `.env` matches your MySQL password.

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Kill the process using the port:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Email Not Sending
- Ensure 2FA is enabled on your Gmail account
- Use App Password, not your regular Gmail password
- Check `ENABLE_EMAIL_NOTIFICATIONS=true` in `.env`

---

## License

This project is for educational purposes.

---

## Support

For issues or questions, please open an issue on GitHub.
