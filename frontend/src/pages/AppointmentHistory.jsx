import React, { useState, useEffect } from 'react'
import { appointmentService } from '../services/api'

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getAppointments()
      setAppointments(response.data || [])
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.appointmentDate) < new Date()
  )

  const filteredAppointments = pastAppointments
    .filter((apt) => (filter === 'all' ? true : apt.status === filter))
    .filter(
      (apt) =>
        apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    )

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Appointment History</h1>
          <p className="text-gray-500 mb-8">View your past appointments and medical records</p>

          {/* Filters and Search */}
          <div className="mb-8 space-y-4">
            <div>
              <input
                type="text"
                placeholder="Search by patient name or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'completed', 'cancelled', 'no-show'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === status
                      ? 'bg-primary text-white'
                      : 'bg-background text-secondary hover:bg-background/80'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Appointments List */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading history...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No past appointments found.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-secondary">Date</p>
                      <p className="text-lg font-semibold text-primary">
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary">Time</p>
                      <p className="text-lg font-semibold text-primary">{apt.appointmentTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary">Reason</p>
                      <p className="text-lg text-primary">{apt.reason}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          apt.status === 'completed'
                            ? 'bg-success/10 text-success'
                            : apt.status === 'cancelled'
                              ? 'bg-danger/10 text-danger'
                              : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  </div>
                  {apt.symptoms && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-secondary">Symptoms/Notes</p>
                      <p className="text-primary">{apt.symptoms}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {filteredAppointments.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600">Completed</p>
                  <p className="text-2xl font-bold text-green-900">
                    {filteredAppointments.filter((a) => a.status === 'completed').length}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-red-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-900">
                    {filteredAppointments.filter((a) => a.status === 'cancelled').length}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">No Show</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredAppointments.filter((a) => a.status === 'no-show').length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AppointmentHistory
