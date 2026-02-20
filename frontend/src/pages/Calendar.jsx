import React, { useState, useEffect } from 'react'
import { doctorService, appointmentService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const Calendar = () => {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState([])
  const [blockedSlots, setBlockedSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBlockForm, setShowBlockForm] = useState(false)
  const [blockData, setBlockData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    reason: '',
  })

  useEffect(() => {
    fetchCalendarData()
  }, [])

  const fetchCalendarData = async () => {
    try {
      const [aptsResponse, availResponse] = await Promise.all([
        appointmentService.getAppointments(),
        doctorService.getDoctorSchedule(user?.id),
      ])
      setAppointments(aptsResponse.data || [])
      setBlockedSlots(availResponse.data || [])
    } catch (error) {
      console.error('Failed to fetch calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBlockSlot = async (e) => {
    e.preventDefault()
    try {
      await doctorService.updateAvailability(user?.id, {
        ...blockData,
        type: 'blocked',
      })
      setBlockData({
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        reason: '',
      })
      setShowBlockForm(false)
      await fetchCalendarData()
    } catch (error) {
      console.error('Failed to block slot:', error)
    }
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const monthDays = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: firstDay }, () => null).concat(
    Array.from({ length: monthDays }, (_, i) => i + 1)
  )

  const getAppointmentsForDate = (day) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    )
      .toISOString()
      .split('T')[0]
    return appointments.filter((apt) => apt.appointmentDate.split('T')[0] === dateStr)
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-primary">Schedule Calendar</h1>
                <p className="text-gray-500">View and manage your appointment schedule</p>
              </div>
              <button
                onClick={() => setShowBlockForm(!showBlockForm)}
                className="bg-danger hover:bg-danger/80 text-white px-6 py-3 rounded-lg font-semibold"
              >
                {showBlockForm ? 'Cancel' : 'Block Time Slot'}
              </button>
            </div>

            {/* Block Slot Form */}
            {showBlockForm && (
              <div className="bg-danger/10 border border-danger rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-danger mb-4">Block Time Slot</h3>
                <form onSubmit={handleBlockSlot} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Date</label>
                      <input
                        type="date"
                        value={blockData.date}
                        onChange={(e) => setBlockData({ ...blockData, date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-danger"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Reason</label>
                      <input
                        type="text"
                        value={blockData.reason}
                        onChange={(e) => setBlockData({ ...blockData, reason: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-danger"
                        placeholder="e.g., Leave, Emergency"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Start Time</label>
                      <input
                        type="time"
                        value={blockData.startTime}
                        onChange={(e) => setBlockData({ ...blockData, startTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-danger"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">End Time</label>
                      <input
                        type="time"
                        value={blockData.endTime}
                        onChange={(e) => setBlockData({ ...blockData, endTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-danger"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-danger hover:bg-danger/80 text-white font-semibold py-2 rounded-lg"
                  >
                    Block Slot
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Month Navigation */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={previousMonth}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                ← Previous
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={nextMonth}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Next →
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-bold text-gray-700 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                const appts = day ? getAppointmentsForDate(day) : []
                return (
                  <div
                    key={index}
                    className={`min-h-24 p-2 rounded-lg border-2 ${
                      day
                        ? 'bg-white border-gray-200 hover:border-blue-400'
                        : 'bg-gray-100 border-transparent'
                    }`}
                  >
                    {day && (
                      <>
                        <div className="font-bold text-gray-900 mb-1">{day}</div>
                        <div className="space-y-1">
                          {appts.slice(0, 2).map((apt) => (
                            <div
                              key={apt.id}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded truncate hover:bg-blue-200"
                              title={apt.patientName}
                            >
                              {apt.appointmentTime}
                            </div>
                          ))}
                          {appts.length > 2 && (
                            <div className="text-xs text-gray-600 font-semibold">
                              +{appts.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                <span className="text-sm text-gray-600">Appointments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span className="text-sm text-gray-600">Blocked Time</span>
              </div>
            </div>
          </div>

          {/* Appointments for Selected Month */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Appointments for {currentDate.toLocaleString('default', { month: 'long' })}
            </h2>
            {appointments.length === 0 ? (
              <p className="text-gray-600">No appointments scheduled.</p>
            ) : (
              <div className="space-y-4">
                {appointments
                  .filter(
                    (apt) =>
                      new Date(apt.appointmentDate).getMonth() === currentDate.getMonth() &&
                      new Date(apt.appointmentDate).getFullYear() === currentDate.getFullYear()
                  )
                  .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
                  .map((apt) => (
                    <div key={apt.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{apt.patientName}</p>
                          <p className="text-sm text-gray-600">{apt.reason}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {new Date(apt.appointmentDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">{apt.appointmentTime}</p>
                          <span
                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mt-2 ${
                              apt.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendar
