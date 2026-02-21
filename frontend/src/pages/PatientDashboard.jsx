import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { appointmentService, doctorService } from '../services/api'

// Helper function to format time
const formatTime = (timeValue) => {
  if (!timeValue) return ''
  if (timeValue.includes('T')) {
    const timePart = timeValue.split('T')[1]?.split('.')[0]
    if (timePart) {
      const [hours, minutes] = timePart.split(':')
      const hour = parseInt(hours, 10)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const hour12 = hour % 12 || 12
      return `${hour12}:${minutes} ${ampm}`
    }
  }
  if (timeValue.includes(':')) {
    const [hours, minutes] = timeValue.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }
  return timeValue
}

const PatientDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBookForm, setShowBookForm] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: '' })
  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    symptoms: '',
    patientPhone: '',
  })

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [appointmentsRes, doctorsRes] = await Promise.all([
        appointmentService.getAppointments(),
        doctorService.getDoctors()
      ])
      setAppointments(appointmentsRes.data || [])
      setDoctors(doctorsRes.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleBookAppointment = async (e) => {
    e.preventDefault()
    try {
      await appointmentService.createAppointment({
        ...formData,
        status: 'pending',
      })
      setFormData({
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: '',
        symptoms: '',
        patientPhone: '',
      })
      setShowBookForm(false)
      await fetchData()
    } catch (error) {
      console.error('Failed to book appointment:', error)
    }
  }

  const handleCancel = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentService.cancelAppointment(appointmentId)
        showNotification('Appointment cancelled')
        await fetchData()
      } catch (error) {
        console.error('Failed to cancel appointment:', error)
        showNotification('Failed to cancel appointment', 'error')
      }
    }
  }

  const handleAccept = async (appointmentId) => {
    try {
      await appointmentService.acceptAppointment(appointmentId)
      showNotification('You accepted the new appointment time!')
      await fetchData()
    } catch (error) {
      console.error('Failed to accept appointment:', error)
      showNotification('Failed to accept appointment', 'error')
    }
  }

  const handleDecline = async (appointmentId) => {
    if (window.confirm('Are you sure you want to decline this new time? The appointment will be cancelled.')) {
      try {
        await appointmentService.declineAppointment(appointmentId)
        showNotification('Appointment declined and cancelled')
        await fetchData()
      } catch (error) {
        console.error('Failed to decline appointment:', error)
        showNotification('Failed to decline appointment', 'error')
      }
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white font-medium`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#5f6FFF]">Patient Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="bg-danger hover:bg-danger/80 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Book Appointment Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowBookForm(!showBookForm)}
            className="bg-[#5f6FFF] hover:bg-[#4f5fe0] text-white px-6 py-3 rounded-lg font-semibold shadow-lg"
          >
            {showBookForm ? 'Cancel' : '+ Book New Appointment'}
          </button>
        </div>

        {/* Book Appointment Form */}
        {showBookForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-[#5f6FFF] mb-6">Book Appointment</h2>
            <form onSubmit={handleBookAppointment} className="space-y-4">
              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Doctor
                </label>
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5f6FFF] focus:border-[#5f6FFF]"
                  required
                >
                  <option value="">-- Choose a Doctor --</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} {doctor.specialty ? `- ${doctor.specialty}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (for SMS reminders)
                </label>
                <input
                  type="tel"
                  name="patientPhone"
                  value={formData.patientPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5f6FFF] focus:border-[#5f6FFF]"
                  placeholder="0712345678"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5f6FFF] focus:border-[#5f6FFF]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Time
                  </label>
                  <input
                    type="time"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5f6FFF] focus:border-[#5f6FFF]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5f6FFF] focus:border-[#5f6FFF]"
                  placeholder="e.g., Regular checkup"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5f6FFF] focus:border-[#5f6FFF]"
                  rows="3"
                  placeholder="Describe any symptoms or concerns"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#5f6FFF] hover:bg-[#4f5fe0] text-white font-semibold py-2 rounded-lg"
              >
                Book Appointment
              </button>
            </form>
          </div>
        )}

        {/* Appointments List */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Appointments</h2>
          {loading ? (
            <div className="text-center text-gray-600">Loading appointments...</div>
          ) : appointments.filter(apt => apt.status !== 'cancelled' && apt.status !== 'completed' && new Date(apt.appointmentDate) >= new Date(new Date().toDateString())).length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">No upcoming appointments.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments
                .filter(apt => apt.status !== 'cancelled' && apt.status !== 'completed' && new Date(apt.appointmentDate) >= new Date(new Date().toDateString()))
                .map((apt) => (
                <div key={apt.id} className="bg-white rounded-lg shadow p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="text-lg font-semibold text-[#5f6FFF]">
                      {new Date(apt.appointmentDate).toLocaleDateString()} at {formatTime(apt.appointmentTime)}
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Doctor</p>
                    <p className="text-gray-900 font-medium">{apt.doctorName || 'N/A'}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Reason</p>
                    <p className="text-gray-900">{apt.reason}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Status</p>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        apt.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : apt.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : apt.status === 'rescheduled'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {apt.status === 'rescheduled' ? 'Rescheduled by Doctor' : apt.status}
                    </span>
                  </div>
                  {apt.status === 'rescheduled' && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700 font-medium">
                        Your doctor has rescheduled this appointment. Please accept or decline the new time.
                      </p>
                    </div>
                  )}
                  {apt.status === 'rescheduled' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(apt.id)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-semibold"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(apt.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-semibold"
                      >
                        Decline
                      </button>
                    </div>
                  ) : apt.status !== 'cancelled' && apt.status !== 'confirmed' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCancel(apt.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appointment History */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Appointment History</h2>
          {appointments.filter(apt => apt.status === 'cancelled' || apt.status === 'completed' || new Date(apt.appointmentDate) < new Date(new Date().toDateString())).length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">No appointment history yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments
                .filter(apt => apt.status === 'cancelled' || apt.status === 'completed' || new Date(apt.appointmentDate) < new Date(new Date().toDateString()))
                .map((apt) => (
                  <div key={apt.id} className="bg-white rounded-lg shadow p-6 opacity-75">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="text-lg font-semibold text-gray-600">
                        {new Date(apt.appointmentDate).toLocaleDateString()} at {formatTime(apt.appointmentTime)}
                      </p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Reason</p>
                      <p className="text-gray-700">{apt.reason}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Doctor</p>
                      <p className="text-gray-700">{apt.doctorName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          apt.status === 'confirmed' || apt.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : apt.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default PatientDashboard
