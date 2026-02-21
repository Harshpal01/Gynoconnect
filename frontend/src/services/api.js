import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => Promise.reject(error))

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, role, phone) => api.post('/auth/register', { name, email, password, role, phone }),
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
}

// Appointment APIs
export const appointmentService = {
  getAppointments: () => api.get('/appointments'),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  createAppointment: (data) => api.post('/appointments', data),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  cancelAppointment: (id) => api.put(`/appointments/${id}/cancel`),
  rescheduleAppointment: (id, data) => api.put(`/appointments/${id}/reschedule`, data),
  acceptAppointment: (id) => api.put(`/appointments/${id}/accept`),
  declineAppointment: (id) => api.put(`/appointments/${id}/decline`),
  getAvailableSlots: (date) => api.get(`/appointments/slots/${date}`),
}

// Doctor APIs
export const doctorService = {
  getDoctors: () => api.get('/doctors'),
  getFeaturedDoctors: () => axios.get(`${API_URL}/doctors/featured`), // Public endpoint, no auth
  getDoctorSchedule: (doctorId) => api.get(`/doctors/${doctorId}/schedule`),
  updateAvailability: (doctorId, data) => api.put(`/doctors/${doctorId}/availability`, data),
  getDoctorAppointments: (doctorId) => api.get(`/doctors/${doctorId}/appointments`),
  removeBlockedSlot: (doctorId, blockId) => api.delete(`/doctors/${doctorId}/blocked/${blockId}`),
  uploadDoctorImage: (doctorId, formData) => api.post(`/doctors/${doctorId}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateDoctor: (doctorId, data) => api.put(`/doctors/${doctorId}`, data),
}

// User APIs
export const userService = {
  getUserProfile: () => api.get('/users/profile'),
  updateUserProfile: (data) => api.put('/users/profile', data),
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
}

// Reports APIs
export const reportService = {
  getStats: (startDate, endDate) => api.get('/reports/stats', { params: { startDate, endDate } }),
  getPatientStats: () => api.get('/reports/patients'),
  getAppointmentReport: (filters) => api.get('/reports/appointments', { params: filters }),
  getDoctorWorkload: (startDate, endDate) => api.get('/reports/doctor-workload', { params: { startDate, endDate } }),
}

export default api
