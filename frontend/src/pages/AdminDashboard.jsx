import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { appointmentService, doctorService } from '../services/api'
import AdminSidebar from './admin/AdminSidebar'
import DashboardTab from './admin/DashboardTab'
import AppointmentsTab from './admin/AppointmentsTab'
import DoctorsTab from './admin/DoctorsTab'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [uploadingImage, setUploadingImage] = useState(null)
  const [notification, setNotification] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  // Appointment handlers
  const handleAddAppointment = async (data) => {
    try {
      await appointmentService.createAppointment(data)
      showNotification('Appointment added successfully!', 'success')
      await fetchData()
      return true
    } catch (error) {
      console.error('Failed to add appointment:', error)
      const errorMsg = error.response?.data?.message || 'Failed to add appointment'
      showNotification(errorMsg, 'error')
      return false
    }
  }

  // Doctor handlers
  const handleImageUpload = async (doctorId, file) => {
    if (!file) return
    
    setUploadingImage(doctorId)
    try {
      const formDataObj = new FormData()
      formDataObj.append('image', file)
      
      await doctorService.uploadDoctorImage(doctorId, formDataObj)
      await fetchData()
      showNotification('Image uploaded successfully!', 'success')
    } catch (error) {
      console.error('Failed to upload image:', error)
      const errorMsg = error.response?.data?.message || 'Failed to upload image'
      showNotification(errorMsg, 'error')
    } finally {
      setUploadingImage(null)
    }
  }

  const handleUpdateDoctor = async (doctorId, data) => {
    try {
      await doctorService.updateDoctor(doctorId, data)
      await fetchData()
      showNotification('Doctor updated successfully!', 'success')
    } catch (error) {
      console.error('Failed to update doctor:', error)
      const errorMsg = error.response?.data?.message || 'Failed to update doctor'
      showNotification(errorMsg, 'error')
    }
  }

  // Stats
  const stats = {
    totalAppointments: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    totalDoctors: doctors.length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg text-white z-50 animation-fade ${
          notification.type === 'success' ? 'bg-green-500' :
          notification.type === 'error' ? 'bg-red-500' :
          'bg-yellow-500'
        }`}>
          {notification.message}
        </div>
      )}
      
      <div className="flex">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-30 flex items-center px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="ml-3 font-semibold text-gray-900">Admin Dashboard</span>
        </div>
        
        {/* Sidebar */}
        <AdminSidebar 
          user={user} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
          {activeTab === 'dashboard' && (
            <DashboardTab 
              appointments={appointments} 
              stats={stats} 
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsTab
              appointments={appointments}
              doctors={doctors}
              loading={loading}
              onAddAppointment={handleAddAppointment}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'doctors' && (
            <DoctorsTab
              doctors={doctors}
              onImageUpload={handleImageUpload}
              onUpdateDoctor={handleUpdateDoctor}
              uploadingImage={uploadingImage}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
