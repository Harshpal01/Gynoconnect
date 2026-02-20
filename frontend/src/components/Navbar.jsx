import React, { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Logo = ({ to, onClick }) => {
  return (
    <Link to={to} className="flex items-center gap-2" onClick={onClick}>
      <svg className="w-8 h-8 text-[#5f6FFF]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.5L17.5 8 12 11.5 6.5 8 12 4.5zM6 9.5l5 3v6l-5-3v-6zm12 0v6l-5 3v-6l5-3z" />
      </svg>
      <span className="text-xl font-bold text-[#5f6FFF]">Gynoconnect</span>
    </Link>
  )
}

const MobileToggle = ({ isOpen, onClick }) => {
  return (
    <button onClick={onClick} className="md:hidden text-gray-700 hover:text-[#5f6FFF] p-2">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
        />
      </svg>
    </button>
  )
}

const DesktopLink = ({ to, label, isActive, onClick }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`font-medium transition ${
        isActive ? 'text-[#5f6FFF] border-b-2 border-[#5f6FFF] pb-1' : 'text-gray-700 hover:text-[#5f6FFF]'
      }`}
    >
      {label}
    </Link>
  )
}

const MobileLink = ({ to, label, onClick, className }) => {
  return (
    <Link to={to} className={className} onClick={onClick}>
      {label}
    </Link>
  )
}

const GuestLinks = ({ pathname, closeMenu }) => {
  const handleDoctorsAnchor = (e) => {
    closeMenu?.()
    if (pathname === '/') {
      e.preventDefault()
      document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <DesktopLink to="/" label="HOME" isActive={pathname === '/'} />
      <a
        href="/#doctors"
        onClick={handleDoctorsAnchor}
        className="text-gray-700 hover:text-[#5f6FFF] font-medium transition"
      >
        ALL DOCTORS
      </a>
      <Link to="/about" className="text-gray-700 hover:text-[#5f6FFF] font-medium transition">
        ABOUT
      </Link>
      <a
        href="/login?role=admin"
        className="text-gray-700 hover:text-[#5f6FFF] font-medium transition border border-gray-300 rounded-full px-4 py-1.5 text-sm"
      >
        Admin Panel
      </a>
    </>
  )
}

const GuestMobileLinks = ({ pathname, closeMenu }) => {
  const handleDoctorsAnchor = (e) => {
    closeMenu()
    if (pathname === '/') {
      e.preventDefault()
      document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="flex flex-col space-y-3">
      <MobileLink
        to="/"
        label="HOME"
        className="px-3 py-2 text-gray-700 hover:text-[#5f6FFF] font-medium"
        onClick={closeMenu}
      />
      <a
        href="/#doctors"
        className="px-3 py-2 text-gray-700 hover:text-[#5f6FFF] font-medium"
        onClick={handleDoctorsAnchor}
      >
        ALL DOCTORS
      </a>
      <MobileLink
        to="/about"
        label="ABOUT"
        className="px-3 py-2 text-gray-700 hover:text-[#5f6FFF] font-medium"
        onClick={closeMenu}
      />
      <MobileLink
        to="/login?role=admin"
        label="Admin Panel"
        className="px-3 py-2 text-gray-600 font-medium"
        onClick={closeMenu}
      />
      <MobileLink
        to="/register"
        label="Create account"
        className="mx-3 py-2 bg-[#5f6FFF] text-white rounded-full text-center font-medium"
        onClick={closeMenu}
      />
    </div>
  )
}

const RoleNavLinks = ({ items, pathname }) => {
  return (
    <>
      {items.map((item) => (
        <DesktopLink key={item.to} to={item.to} label={item.label} isActive={pathname === item.to} />
      ))}
    </>
  )
}

const RoleMobileLinks = ({ items, closeMenu }) => {
  return (
    <>
      {items.map((item) => (
        <MobileLink
          key={item.to}
          to={item.to}
          label={item.label}
          className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
          onClick={closeMenu}
        />
      ))}
    </>
  )
}

const ProfileDropdown = ({ user, dashboardLink, isOpen, setIsOpen, onLogout }) => {
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 focus:outline-none">
        <div className="w-10 h-10 bg-[#5f6FFF]/10 rounded-full flex items-center justify-center">
          <span className="text-[#5f6FFF] font-bold text-lg">{user?.name?.charAt(0).toUpperCase()}</span>
        </div>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="font-medium text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
          </div>
          <Link
            to={dashboardLink}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          {user?.role === 'patient' && (
            <Link
              to="/patient/profile"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              My Profile
            </Link>
          )}
          <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50">
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  const closeMobileMenu = () => setIsMenuOpen(false)

  const dashboardLink = useMemo(() => {
    if (!user) return '/login'
    switch (user.role) {
      case 'patient':
        return '/patient/appointments'
      case 'admin':
        return '/admin/dashboard'
      case 'doctor':
        return '/doctor/schedule'
      default:
        return '/login'
    }
  }, [user])

  const roleItems = useMemo(() => {
    const config = {
      patient: [
        { to: '/patient/appointments', label: 'My Appointments' },
        { to: '/patient/history', label: 'History' },
        { to: '/patient/profile', label: 'Profile' },
      ],
      admin: [
        { to: '/admin/dashboard', label: 'Dashboard' },
        { to: '/admin/reports', label: 'Reports' },
      ],
      doctor: [
        { to: '/doctor/schedule', label: 'Schedule' },
        { to: '/doctor/calendar', label: 'Calendar' },
        { to: '/doctor/reports', label: 'Reports' },
      ],
    }

    return config[user?.role] || []
  }, [user?.role])

  const handleLogout = () => {
    logout()
    navigate('/')
    setShowProfileMenu(false)
    closeMobileMenu()
  }

  if (isAuthPage && !user) return null

  if (!user) {
    return (
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo to="/" onClick={() => setShowProfileMenu(false)} />

            <div className="hidden md:flex items-center space-x-8">
              <GuestLinks pathname={location.pathname} closeMenu={closeMobileMenu} />
            </div>

            <div className="hidden md:block">
              <Link
                to="/register"
                className="bg-[#5f6FFF] hover:bg-[#4f5fe0] text-white px-6 py-2 rounded-full font-medium transition"
              >
                Create account
              </Link>
            </div>

            <MobileToggle isOpen={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} />
          </div>

          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <GuestMobileLinks pathname={location.pathname} closeMenu={closeMobileMenu} />
            </div>
          )}
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo to="/" onClick={() => setShowProfileMenu(false)} />

          <div className="hidden md:flex items-center space-x-8">
            <RoleNavLinks items={roleItems} pathname={location.pathname} />
          </div>

          <div className="flex items-center space-x-4">
            <ProfileDropdown
              user={user}
              dashboardLink={dashboardLink}
              isOpen={showProfileMenu}
              setIsOpen={setShowProfileMenu}
              onLogout={handleLogout}
            />

            <MobileToggle isOpen={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} />
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-1">
              <RoleMobileLinks items={roleItems} closeMenu={closeMobileMenu} />
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
