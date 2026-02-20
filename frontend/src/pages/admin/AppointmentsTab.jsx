import React, { useState } from 'react'
import { appointmentService } from '../../services/api'

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

const WalkInForm = ({ doctors, onSubmit, onCancel, showNotification }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    doctorId: '',
  })
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const fetchAvailableSlots = async (doctorId, date) => {
    if (!doctorId || !date) {
      setAvailableSlots([])
      return
    }
    setLoadingSlots(true)
    try {
      const response = await appointmentService.getAvailableSlots(date)
      const slotsForDoctor = response.data.filter(slot => slot.doctorId === parseInt(doctorId))
      setAvailableSlots(slotsForDoctor)
      if (slotsForDoctor.length === 0) {
        showNotification('No available slots for selected doctor on this date', 'warning')
      }
    } catch (error) {
      console.error('Failed to fetch slots:', error)
      showNotification('Failed to load available slots', 'error')
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    if (name === 'doctorId' || name === 'appointmentDate') {
      const doctorId = name === 'doctorId' ? value : formData.doctorId
      const date = name === 'appointmentDate' ? value : formData.appointmentDate
      fetchAvailableSlots(doctorId, date)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.doctorId) {
      showNotification('Please select a doctor', 'error')
      return
    }
    if (!formData.appointmentTime) {
      showNotification('Please select an appointment time', 'error')
      return
    }

    await onSubmit({
      ...formData,
      doctorId: parseInt(formData.doctorId),
      status: 'confirmed',
      source: 'walk-in',
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Walk-in Appointment</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5f6FFF]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="patientEmail"
            value={formData.patientEmail}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5f6FFF]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            name="patientPhone"
            value={formData.patientPhone}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5f6FFF]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Doctor *</label>
          <select
            name="doctorId"
            value={formData.doctorId}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5f6FFF]"
            required
          >
            <option value="">Select a doctor</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} {doc.specialty && `(${doc.specialty})`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            name="appointmentDate"
            value={formData.appointmentDate}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5f6FFF]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time {loadingSlots && <span className="text-xs text-gray-500">(Loading...)</span>}
          </label>
          {formData.doctorId && formData.appointmentDate ? (
            <>
              {availableSlots.length > 0 ? (
                <select
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5f6FFF]"
                  required
                >
                  <option value="">Select a time</option>
                  {availableSlots.map((slot, idx) => (
                    <option key={idx} value={slot.time}>
                      {slot.time}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-[#5f6FFF] bg-yellow-50"
                />
              )}
            </>
          ) : (
            <input
              type="time"
              name="appointmentTime"
              value={formData.appointmentTime}
              onChange={handleInputChange}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-400"
              placeholder="Select doctor and date first"
            />
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
          <input
            type="text"
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5f6FFF]"
            required
          />
        </div>
        <div className="md:col-span-2 flex gap-4">
          <button 
            type="submit" 
            className="flex-1 bg-[#5f6FFF] hover:bg-[#4f5fe0] text-white py-2 rounded-lg font-medium"
          >
            Add Appointment
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

const AppointmentsTab = ({ 
  appointments, 
  doctors, 
  loading, 
  onConfirm, 
  onCancel, 
  onAddAppointment,
  showNotification 
}) => {
  const [filter, setFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)

  const filteredAppointments = filter === 'all'
    ? appointments
    : appointments.filter((apt) => apt.status === filter)

  const handleAddAppointment = async (data) => {
    const success = await onAddAppointment(data)
    if (success) {
      setShowAddForm(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">All Appointments</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#5f6FFF] hover:bg-[#4f5fe0] text-white px-6 py-2 rounded-lg font-medium"
        >
          {showAddForm ? 'Cancel' : '+ Add Appointment'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <WalkInForm 
          doctors={doctors}
          onSubmit={handleAddAppointment}
          onCancel={() => setShowAddForm(false)}
          showNotification={showNotification}
        />
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'confirmed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === status
                ? 'bg-[#5f6FFF] text-white'
                : 'bg-white text-gray-700 border hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No appointments found.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#EAEFFF] rounded-full flex items-center justify-center">
                        <span className="text-[#5f6FFF] text-sm font-medium">
                          {String(apt.patientName || 'U').charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {String(apt.patientName || 'Unknown')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(apt.appointmentDate).toLocaleDateString()} at {formatTime(apt.appointmentTime)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{apt.reason}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {apt.status === 'pending' && (
                        <button
                          onClick={() => onConfirm(apt.id)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Confirm
                        </button>
                      )}
                      {apt.status !== 'cancelled' && (
                        <button
                          onClick={() => onCancel(apt.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AppointmentsTab
