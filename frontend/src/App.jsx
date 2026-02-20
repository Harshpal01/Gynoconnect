import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import AboutUs from './pages/AboutUs'
import Login from './pages/Login'
import Register from './pages/Register'
import PatientDashboard from './pages/PatientDashboard'
import PatientProfile from './pages/PatientProfile'
import AppointmentHistory from './pages/AppointmentHistory'
import AdminDashboard from './pages/AdminDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import Calendar from './pages/Calendar'
import Reports from './pages/Reports'
import NotificationManagement from './pages/NotificationManagement'
import ProtectedRoute from './components/ProtectedRoute'

const AppContent = () => {
  const location = useLocation()
  const hideFooter = location.pathname.startsWith('/admin')

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/register" element={<Register />} />
          {/* Patient Routes */}
          <Route
            path="/patient/appointments"
            element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>}
          />
          <Route
            path="/patient/profile"
            element={<ProtectedRoute role="patient"><PatientProfile /></ProtectedRoute>}
          />
          <Route
            path="/patient/history"
            element={<ProtectedRoute role="patient"><AppointmentHistory /></ProtectedRoute>}
          />
          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}
          />
          <Route
            path="/admin/reports"
            element={<ProtectedRoute role="admin"><Reports /></ProtectedRoute>}
          />
          <Route
            path="/admin/notifications"
            element={<ProtectedRoute role="admin"><NotificationManagement /></ProtectedRoute>}
          />
          {/* Doctor Routes */}
          <Route
            path="/doctor/schedule"
            element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>}
          />
          <Route
            path="/doctor/calendar"
            element={<ProtectedRoute role="doctor"><Calendar /></ProtectedRoute>}
          />
          <Route
            path="/doctor/reports"
            element={<ProtectedRoute role="doctor"><Reports /></ProtectedRoute>}
          />
          {/* Redirect unknown routes to landing */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
}

const App = () => {
  return (
    <Router>
      <AuthContext>
        <AppContent />
      </AuthContext>
    </Router>
  )
}

export default App