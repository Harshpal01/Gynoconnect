import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContextProvider = createContext()

export const AuthContext = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser && token) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [token])

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      const { token: newToken, user: userData } = response.data
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))
      setToken(newToken)
      setUser(userData)
      return userData
    } catch (error) {
      throw error.response?.data?.message || 'Login failed'
    }
  }

  const register = async (name, email, password, role, phone) => {
    try {
      const response = await authService.register(name, email, password, role, phone)
      const { token: newToken, user: userData } = response.data
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))
      setToken(newToken)
      setUser(userData)
      return userData
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed'
    }
  }

  const logout = () => {
    authService.logout()
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContextProvider.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContextProvider.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContextProvider)
  if (!context) {
    throw new Error('useAuth must be used within AuthContext')
  }
  return context
}
