import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'


const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('admin') // 'admin', 'doctor', 'patient'
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(email, password)
      // Redirect based on role
      if (user.role === 'patient') {
        navigate('/patient/appointments')
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (user.role === 'doctor') {
        navigate('/doctor/schedule')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(typeof err === 'string' ? err : 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Role switch links
  const renderRoleSwitch = () => {
    if (role === 'admin') {
      return (
        <div className="mt-4 text-center">
          <span className="text-gray-600 text-sm">Doctor Login?{' '}</span>
          <button type="button" className="text-[#5f6FFF] hover:underline text-sm font-medium" onClick={() => setRole('doctor')}>
            Click here
          </button>
          <br />
          <span className="text-gray-600 text-sm">Patient Login?{' '}</span>
          <button type="button" className="text-[#5f6FFF] hover:underline text-sm font-medium" onClick={() => setRole('patient')}>
            Click here
          </button>
        </div>
      )
    } else if (role === 'doctor') {
      return (
        <div className="mt-4 text-center">
          <span className="text-gray-600 text-sm">Admin Login?{' '}</span>
          <button type="button" className="text-[#5f6FFF] hover:underline text-sm font-medium" onClick={() => setRole('admin')}>
            Click here
          </button>
          <br />
          <span className="text-gray-600 text-sm">Patient Login?{' '}</span>
          <button type="button" className="text-[#5f6FFF] hover:underline text-sm font-medium" onClick={() => setRole('patient')}>
            Click here
          </button>
        </div>
      )
    } else {
      return (
        <div className="mt-4 text-center">
          <span className="text-gray-600 text-sm">Admin Login?{' '}</span>
          <button type="button" className="text-[#5f6FFF] hover:underline text-sm font-medium" onClick={() => setRole('admin')}>
            Click here
          </button>
          <br />
          <span className="text-gray-600 text-sm">Doctor Login?{' '}</span>
          <button type="button" className="text-[#5f6FFF] hover:underline text-sm font-medium" onClick={() => setRole('doctor')}>
            Click here
          </button>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-2">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#5f6FFF]">Gynoconnect</h1>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-xl font-semibold text-center mb-1">
            <span className={role === 'admin' ? 'text-[#5f6FFF]' : role === 'doctor' ? 'text-green-600' : 'text-pink-600'}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>{' '}Login
          </h2>
          <p className="text-gray-500 text-center text-xs mb-4">
            {role === 'admin' && 'Login as admin to manage the system.'}
            {role === 'doctor' && 'Doctor login to manage appointments.'}
            {role === 'patient' && 'Patient login to book appointments.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5f6FFF] focus:border-[#5f6FFF] outline-none transition text-sm"
                placeholder={role === 'admin' ? 'admin@example.com' : role === 'doctor' ? 'doctor@example.com' : 'patient@example.com'}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5f6FFF] focus:border-[#5f6FFF] outline-none transition text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5f6FFF] hover:bg-[#4f5fe0] disabled:bg-gray-300 text-white font-medium py-2 px-3 rounded-lg transition duration-200 text-base"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {renderRoleSwitch()}
          <div className="mt-6 text-center">
            {role === 'patient' && (
              <p className="text-gray-500 text-sm">
                Create a new account?{' '}
                <Link to="/register" className="text-[#5f6FFF] hover:underline font-medium">
                  Click here
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <Link 
            to="/" 
            className="text-[#5f6FFF] hover:underline text-sm font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
