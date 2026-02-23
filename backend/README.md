# Hospital Appointment System - Backend

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy the example environment file and edit it with your settings:

```bash
cp .env.example .env
```

Then edit `.env` with your credentials:

```
# Database - Set your MySQL password
DB_PASSWORD=your_mysql_password

# JWT Secret - Generate a random string (e.g., use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_secret_key

# Email (optional) - For Gmail, use App Password (not regular password)
# Go to Google Account > Security > 2FA > App Passwords
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS (optional) - Africa's Talking API
AT_USERNAME=your_username
AT_API_KEY=your_api_key
```

### 3. Setup Database

1. Start MySQL server
2. Run the SQL script to create the database and tables:

```bash
mysql -u root -p < config/init-db.sql
```

Or manually import `config/init-db.sql` using MySQL Workbench or phpMyAdmin.

### 4. Run the Server

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Appointments

- `GET /api/appointments` - Get all appointments (filtered by role)
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `PUT /api/appointments/:id/cancel` - Cancel appointment
- `PUT /api/appointments/:id/reschedule` - Reschedule appointment
- `GET /api/appointments/slots/:date` - Get available time slots

### Doctors

- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id/schedule` - Get doctor schedule
- `PUT /api/doctors/:id/availability` - Update doctor availability
- `GET /api/doctors/:id/appointments` - Get doctor's appointments

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (admin only)

## Demo Credentials

- Patient: `patient@example.com` / `demo123`
- Receptionist: `receptionist@example.com` / `demo123`
- Doctor: `doctor@example.com` / `demo123`
