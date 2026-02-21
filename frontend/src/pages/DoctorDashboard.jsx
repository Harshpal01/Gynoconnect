import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { doctorService, appointmentService } from '../services/api'

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

const DoctorDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false)
  const [availabilityData, setAvailabilityData] = useState({
    dayOfWeek: 'monday',
    startTime: '09:00',
    endTime: '17:00',
  })
  const [filter, setFilter] = useState('all')
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [scheduleData, setScheduleData] = useState({
    patientName: '',
    patientPhone: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    symptoms: '',
  })
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [scheduleError, setScheduleError] = useState('')
  const [notification, setNotification] = useState({ show: false, message: '', type: '' })
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [rescheduleData, setRescheduleData] = useState({ id: null, date: '', time: '' })

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000)
  }

  const handleConfirm = async (id) => {
    try {
      await appointmentService.updateAppointment(id, { status: 'confirmed' })
      showNotification('Appointment confirmed! Patient has been notified.')
      await fetchDoctorData()
    } catch (error) {
      showNotification('Failed to confirm appointment', 'error')
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment? The patient will be notified.')) return
    try {
      await appointmentService.cancelAppointment(id)
      showNotification('Appointment cancelled. Patient has been notified.')
      await fetchDoctorData()
    } catch (error) {
      showNotification('Failed to cancel appointment', 'error')
    }
  }

  const openRescheduleModal = (apt) => {
    setRescheduleData({ id: apt.id, date: '', time: '' })
    setShowRescheduleModal(true)
  }

  const handleReschedule = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      showNotification('Please select a new date and time', 'error')
      return
    }
    try {
      await appointmentService.rescheduleAppointment(rescheduleData.id, {
        appointmentDate: rescheduleData.date,
        appointmentTime: rescheduleData.time,
      })
      showNotification('Appointment rescheduled! Patient has been notified with the new date/time.')
      setShowRescheduleModal(false)
      await fetchDoctorData()
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to reschedule appointment', 'error')
    }
  }

  const handleScheduleChange = (e) => {
    const { name, value } = e.target
    setScheduleData((prev) => ({ ...prev, [name]: value }))
  }

  const handleScheduleAppointment = async (e) => {
    e.preventDefault()
    setScheduleLoading(true)
    setScheduleError('')
    try {
      await appointmentService.createAppointment({
        ...scheduleData,
        doctorId: user?.id,
      })
      setShowScheduleForm(false)
      setScheduleData({
        patientName: '',
        patientPhone: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: '',
        symptoms: '',
      })
      await fetchDoctorData()
    } catch (error) {
      setScheduleError('Failed to schedule appointment')
    } finally {
      setScheduleLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctorData()
  }, [])

  const fetchDoctorData = async () => {
    try {
      const [aptsResponse, availResponse] = await Promise.all([
        appointmentService.getAppointments(),
        doctorService.getDoctorSchedule(user?.id),
      ])
      setAppointments(aptsResponse.data || [])
      setAvailability(availResponse.data || [])
    } catch (error) {
      console.error('Failed to fetch doctor data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvailabilityChange = (e) => {
    const { name, value } = e.target
    setAvailabilityData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddAvailability = async (e) => {
    e.preventDefault()
    try {
      await doctorService.updateAvailability(user?.id, availabilityData)
      setAvailabilityData({
        dayOfWeek: 'monday',
        startTime: '09:00',
        endTime: '17:00',
      })
      setShowAvailabilityForm(false)
      await fetchDoctorData()
    } catch (error) {
      console.error('Failed to update availability:', error)
    }
  }

  const todayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointmentDate).toDateString()
    return aptDate === new Date().toDateString()
  })

  const filteredAppointments =
    filter === 'today'
      ? todayAppointments
      : appointments

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
        } text-white`}>
          {notification.message}
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reschedule Appointment</h3>
            <p className="text-gray-600 mb-4">Select a new date and time. The patient will be notified via email/SMS.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
                <input
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Time</label>
                <input
                  type="time"
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                className="flex-1 px-4 py-2 bg-[#5f6FFF] hover:bg-[#4f5fe0] text-white rounded-lg font-medium"
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#5f6FFF]">Doctor Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Schedule Appointment Button */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setShowScheduleForm((v) => !v)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {showScheduleForm ? 'Cancel' : 'Schedule Appointment'}
          </button>
        </div>

        {/* Schedule Appointment Form */}
        {showScheduleForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Schedule Appointment</h2>
            <form onSubmit={handleScheduleAppointment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                  <input type="text" name="patientName" value={scheduleData.patientName} onChange={handleScheduleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient Phone</label>
                  <input type="tel" name="patientPhone" value={scheduleData.patientPhone} onChange={handleScheduleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input type="date" name="appointmentDate" value={scheduleData.appointmentDate} onChange={handleScheduleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input type="time" name="appointmentTime" value={scheduleData.appointmentTime} onChange={handleScheduleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <input type="text" name="reason" value={scheduleData.reason} onChange={handleScheduleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                  <input type="text" name="symptoms" value={scheduleData.symptoms} onChange={handleScheduleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              {scheduleError && <div className="text-red-600">{scheduleError}</div>}
              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg" disabled={scheduleLoading}>
                {scheduleLoading ? 'Scheduling...' : 'Schedule Appointment'}
              </button>
            </form>
          </div>
        )}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#5f6FFF]">
            <p className="text-gray-500 text-sm">Total Appointments</p>
            <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Today's Appointments</p>
            <p className="text-3xl font-bold text-gray-900">{todayAppointments.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm">Available Slots</p>
            <p className="text-3xl font-bold text-gray-900">{availability.length}</p>
          </div>
        </div>

        {/* Manage Availability */}
        <div className="mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setShowAvailabilityForm(!showAvailabilityForm)}
              className="bg-[#5f6FFF] hover:bg-[#4f5fe0] text-white px-6 py-3 rounded-lg font-semibold"
            >
              {showAvailabilityForm ? 'Cancel' : 'Manage Availability'}
            </button>
          </div>
        </div>

        {/* Availability Form */}
        {showAvailabilityForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add Availability</h2>
            <form onSubmit={handleAddAvailability} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day of Week
                  </label>
                  <select
                    name="dayOfWeek"
                    value={availabilityData.dayOfWeek}
                    onChange={handleAvailabilityChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5f6FFF] focus:border-[#5f6FFF]"
                  >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={availabilityData.startTime}
                    onChange={handleAvailabilityChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5f6FFF] focus:border-[#5f6FFF]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={availabilityData.endTime}
                    onChange={handleAvailabilityChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5f6FFF] focus:border-[#5f6FFF]"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#5f6FFF] hover:bg-[#4f5fe0] text-white font-semibold py-2 rounded-lg"
              >
                Add Availability
              </button>
            </form>
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 flex gap-2">
          {['all', 'today'].map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === option
                  ? 'bg-[#5f6FFF] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option === 'all' ? 'All Appointments' : "Today's Appointments"}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Appointments</h2>
          {loading ? (
            <div className="text-center text-gray-600">Loading appointments...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">No appointments found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Symptoms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{apt.patientName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(apt.appointmentDate).toLocaleDateString()} at {formatTime(apt.appointmentTime)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{apt.reason}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{apt.symptoms || '-'}</td>
                      <td className="px-6 py-4 text-sm">
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
                          {apt.status === 'rescheduled' ? 'Awaiting Patient' : apt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          {apt.status === 'pending' && (
                            <button
                              onClick={() => handleConfirm(apt.id)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Confirm
                            </button>
                          )}
                          {apt.status !== 'cancelled' && (
                            <>
                              <button
                                onClick={() => openRescheduleModal(apt)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => handleCancel(apt.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default DoctorDashboard
