# GynoConnect - Hospital Appointment System

A comprehensive hospital appointment scheduling system built with Node.js, Express, PostgreSQL, and React.

## Features

- **Patient Portal**: Book appointments, view history, accept/decline rescheduled appointments
- **Doctor Dashboard**: Manage appointments, confirm/cancel/reschedule patient bookings
- **Admin Panel**: Oversee all appointments, manage doctors and users, generate reports
- **Notifications**: Email and SMS reminders (24-hour and same-day)
- **Role-based access**: separate admin, doctor, and patient flows

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v13 or higher) - [Download](https://www.postgresql.org/download/)
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
copy .env.example .env
```

Open `backend/.env` in a text editor and configure the PostgreSQL settings:

```env
# Backend server
PORT=5000

# PostgreSQL
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=YOUR_PG_PASSWORD
PGDATABASE=hospital_appointments

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Email settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS settings
AT_USERNAME=your_username
AT_API_KEY=your_api_key
ENABLE_SMS_NOTIFICATIONS=false
ENABLE_EMAIL_NOTIFICATIONS=true
```

> Note: `EMAIL_PASS` should be a Gmail App Password if you are using Gmail.

### 4. Setup Database

The backend now uses PostgreSQL, so run the schema script with `psql` or pgAdmin.

**Option A: Using psql**
```bash
psql -U postgres -f backend/config/init-db.sql
```

**Option B: Using pgAdmin**
1. Open pgAdmin and connect to your PostgreSQL server.
2. Create the `hospital_appointments` database if it does not already exist.
3. Open `backend/config/init-db.sql`.
4. Execute the script.

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

## Deploying to Render
This repository includes a `render.yaml` manifest that defines both the backend and frontend services plus a PostgreSQL database.

### 1. Connect your repository
1. Sign in to Render and create a new Web Service.
2. Choose "Deploy from GitHub" and connect the `Harshpal01/Gynoconnect` repository.
3. Render will detect `render.yaml` automatically.

### 2. Configure secrets
In Render, add the following environment secrets for the backend service:
- `PGPASSWORD`
- `JWT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`
- `AT_USERNAME`
- `AT_API_KEY`

The manifest already sets the database name to `hospital_appointments` and the backend port to `5000`.

### 3. Frontend API URL
The frontend uses `VITE_API_URL` to call the backend API. Update the value in Render if the backend service URL is different from:
```
https://gynoconnect-backend.onrender.com/api
```

### 4. Deploy
After Render finishes building both services, your app should be available at the URLs Render assigns to the frontend and backend services.

---

## Default Login Credentials

Use these seeded accounts after database setup.

| Role   | Email                         | Password |
|--------|-------------------------------|----------|
| Admin  | admin@example.com             | demo123  |
| Doctor | doctor@example.com            | demo123  |
| Doctor | sarahlangat@gmail.com         | demo123  |
| Doctor | dominickipkorir@gmail.com     | demo123  |
| Doctor | teddyochieng@gmail.com        | demo123  |
| Patient| patient@example.com           | demo123  |

---

## Project Structure

```
├── backend/
│   ├── config/
│   │   ├── database.js          # PostgreSQL connection pool
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
│   │   ├── services/            # API client
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
Error: password authentication failed for user "postgres"
```
**Solution:** Verify `PGUSER`, `PGPASSWORD`, and `PGDATABASE` in `backend/.env`.

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
