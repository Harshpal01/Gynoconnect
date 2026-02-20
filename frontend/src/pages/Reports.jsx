import React, { useState, useEffect } from 'react'
import { appointmentService } from '../services/api'

const Reports = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week')

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

  const getDateRange = () => {
    const today = new Date()
    const startDate = new Date()
    const endDate = new Date()

    if (timeRange === 'week') {
      startDate.setDate(today.getDate() - 7)
      endDate.setDate(today.getDate() + 7) // Include next 7 days too
    } else if (timeRange === 'month') {
      startDate.setMonth(today.getMonth() - 1)
      endDate.setMonth(today.getMonth() + 1) // Include next month too
    } else if (timeRange === 'all') {
      // Show all appointments
      return appointments
    }

    return appointments.filter((apt) => {
      const aptDate = new Date(apt.appointmentDate)
      return aptDate >= startDate && aptDate <= endDate
    })
  }

  const filteredAppointments = getDateRange()

  const stats = {
    total: filteredAppointments.length,
    completed: filteredAppointments.filter((a) => a.status === 'completed').length,
    cancelled: filteredAppointments.filter((a) => a.status === 'cancelled').length,
    noShow: filteredAppointments.filter((a) => a.status === 'no-show').length,
    pending: filteredAppointments.filter((a) => a.status === 'pending').length,
    confirmed: filteredAppointments.filter((a) => a.status === 'confirmed').length,
  }

  // Peak hours analysis
  const peakHours = {}
  filteredAppointments.forEach((apt) => {
    if (apt.appointmentTime) {
      const hour = String(apt.appointmentTime).split(':')[0]
      peakHours[hour] = (peakHours[hour] || 0) + 1
    }
  })

  const sortedPeakHours = Object.entries(peakHours)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Appointment reasons
  const reasons = {}
  filteredAppointments.forEach((apt) => {
    if (apt.reason) {
      reasons[apt.reason] = (reasons[apt.reason] || 0) + 1
    }
  })

  const sortedReasons = Object.entries(reasons)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-500">Appointment statistics and insights</p>
              </div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5f6FFF]"
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-sm text-blue-700 font-medium">Total</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{stats.total}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                <p className="text-sm text-yellow-700 font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.pending}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <p className="text-sm text-green-700 font-medium">Confirmed</p>
                <p className="text-2xl font-bold text-green-700 mt-1">{stats.confirmed}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 border-l-4 border-emerald-500">
                <p className="text-sm text-emerald-700 font-medium">Completed</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.completed}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                <p className="text-sm text-red-700 font-medium">Cancelled</p>
                <p className="text-2xl font-bold text-red-700 mt-1">{stats.cancelled}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                <p className="text-sm text-orange-700 font-medium">No Show</p>
                <p className="text-2xl font-bold text-orange-700 mt-1">{stats.noShow}</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Peak Hours */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Peak Hours</h2>
              {sortedPeakHours.length > 0 ? (
                <div className="space-y-4">
                  {sortedPeakHours.map(([hour, count]) => (
                    <div key={hour}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{hour}:00</span>
                        <span className="text-sm text-gray-500">{count} appointments</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${(count / Math.max(...sortedPeakHours.map(([, c]) => c))) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No appointment data available for this period</p>
              )}
            </div>

            {/* Appointment Reasons */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Common Reasons</h2>
              {sortedReasons.length > 0 ? (
                <div className="space-y-4">
                  {sortedReasons.map(([reason, count], index) => {
                    const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
                    return (
                      <div key={reason}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">{reason}</span>
                          <span className="text-sm text-gray-500">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${colors[index] || 'bg-gray-500'}`}
                            style={{
                              width: `${(count / Math.max(...sortedReasons.map(([, c]) => c))) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No reason data available for this period</p>
              )}
            </div>
          </div>

          {/* Daily Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Daily Summary</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Total</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Pending</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Confirmed</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Completed</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Cancelled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(
                    filteredAppointments.reduce((acc, apt) => {
                      const date = new Date(apt.appointmentDate).toLocaleDateString()
                      if (!acc[date]) {
                        acc[date] = { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
                      }
                      acc[date].total++
                      if (apt.status === 'pending') acc[date].pending++
                      if (apt.status === 'confirmed') acc[date].confirmed++
                      if (apt.status === 'completed') acc[date].completed++
                      if (apt.status === 'cancelled') acc[date].cancelled++
                      return acc
                    }, {})
                  )
                    .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                    .map(([date, data]) => (
                      <tr key={date} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">{date}</td>
                        <td className="px-4 py-3 text-gray-900 font-semibold">{data.total}</td>
                        <td className="px-4 py-3">
                          <span className="text-yellow-600 font-medium">{data.pending}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-green-600 font-medium">{data.confirmed}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-emerald-600 font-medium">{data.completed}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-red-600 font-medium">{data.cancelled}</span>
                        </td>
                      </tr>
                    ))}
                  {filteredAppointments.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        No appointments found for this time period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
