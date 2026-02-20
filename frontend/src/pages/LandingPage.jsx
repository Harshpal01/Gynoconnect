import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { doctorService } from '../services/api'
import doctor1 from '../assets/doctor 1.png'
import doctor2 from '../assets/doctor 2.png'
import doctor3 from '../assets/doctor 3.png'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const LandingPage = () => {
  const [featuredDoctors, setFeaturedDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedDoctors = async () => {
      try {
        const response = await doctorService.getFeaturedDoctors()
        setFeaturedDoctors(response.data)
      } catch (error) {
        console.error('Failed to fetch featured doctors:', error)
        // Fallback to default doctors if API fails
        setFeaturedDoctors([
          { id: 1, name: 'Dr. Sarah Langat', specialty: 'Gynecologist', available: true },
          { id: 2, name: 'Dr. Dominic Kipkorir', specialty: 'Fertility Specialist', available: true },
          { id: 3, name: 'Dr. Teddy Ochieng', specialty: 'Prenatal Care Specialist', available: true },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchFeaturedDoctors()
  }, [])

  const specialities = [
    { name: 'Prenatal Care', icon: '🤰', color: 'bg-pink-100' },
    { name: 'Gynecology', icon: '💗', color: 'bg-rose-100' },
    { name: 'Fertility', icon: '🌸', color: 'bg-purple-100' },
    { name: 'Menopause Care', icon: '🌺', color: 'bg-orange-100' },
    { name: 'Family Planning', icon: '👨‍👩‍👧', color: 'bg-blue-100' },
    { name: 'Women Wellness', icon: '💪', color: 'bg-green-100' },
  ]

  // Use fetched doctors or fallback
  const displayDoctors = featuredDoctors.length > 0 ? featuredDoctors : [
    { id: 1, name: 'Dr. Sarah Langat', specialty: 'Gynecologist', available: true },
    { id: 2, name: 'Dr. Dominic Kipkorir', specialty: 'Fertility Specialist', available: true },
    { id: 3, name: 'Dr. Teddy Ochieng', specialty: 'Prenatal Care Specialist', available: true },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner - Prescripto Style */}
      <section className="px-4 sm:px-6 lg:px-8 pt-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#5f6FFF] rounded-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Left Content */}
              <div className="p-6 lg:p-16 lg:w-1/2 z-10 lg:pb-24 text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-semibold text-white leading-tight mb-6">
                  Book Appointment <br />
                  With Trusted Doctors
                </h1>
                
                {/* Doctor avatars and text - Hidden on mobile */}
                <div className="hidden lg:flex items-center gap-4 mb-8">
                  <div className="flex -space-x-2">
                    <img src={doctor1} alt="" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                    <img src={doctor2} alt="" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                    <img src={doctor3} alt="" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                  </div>
                  <p className="text-white/90 text-sm max-w-xs leading-relaxed">
                    Simply browse through our extensive list of trusted doctors,
                    <br />schedule your appointment hassle-free.
                  </p>
                </div>
                
                {/* Mobile description text */}
                <p className="lg:hidden text-white/90 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
                  Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.
                </p>
                
                <Link
                  to="/login?role=patient"
                  className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-700 px-6 lg:px-8 py-3 rounded-full font-medium transition text-sm"
                >
                  Book appointment
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              {/* Right - Three Doctors */}
              <div className="lg:w-[55%] lg:absolute lg:right-0 lg:bottom-0 hidden lg:flex items-end justify-center">
                <div className="flex items-end justify-center gap-0">
                  {/* Doctor 1 - Left */}
                  <img 
                    src={doctor1} 
                    alt="Doctor" 
                    className="h-[300px] w-auto object-contain"
                    style={{ marginRight: '-140px' }}
                  />
                  
                  {/* Doctor 2 - Center (front, larger) */}
                  <img 
                    src={doctor2} 
                    alt="Doctor" 
                    className="h-[360px] w-auto object-contain relative z-20"
                  />
                  
                  {/* Doctor 3 - Right */}
                  <img 
                    src={doctor3} 
                    alt="Doctor" 
                    className="h-[300px] w-auto object-contain"
                    style={{ marginLeft: '-80px' }}
                  />
                </div>
              </div>
              
              {/* Mobile Hero Image */}
              <div className="lg:hidden w-full flex justify-center pb-6 pt-4">
                <div className="flex items-end justify-center">
                  <img src={doctor1} alt="Doctor" className="h-24 sm:h-28 w-auto object-contain" style={{ marginRight: '-30px' }} />
                  <img src={doctor2} alt="Doctor" className="h-32 sm:h-36 w-auto object-contain z-20" />
                  <img src={doctor3} alt="Doctor" className="h-24 sm:h-28 w-auto object-contain" style={{ marginLeft: '-30px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Find by Speciality */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 lg:mb-14">
            <h2 className="text-2xl lg:text-3xl font-semibold text-[#1a1a2e] mb-3 lg:mb-4">
              Find by Speciality
            </h2>
            <p className="text-gray-500 text-sm lg:text-base max-w-xl mx-auto leading-relaxed">
              Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 max-w-5xl mx-auto">
            {specialities.map((spec, index) => (
              <Link
                key={index}
                to="/login?role=patient"
                className="group flex flex-col items-center justify-center py-6 px-3 bg-white border border-gray-200 rounded-2xl hover:shadow-xl hover:border-[#5f6FFF]/30 transition-all duration-300 cursor-pointer"
              >
                <div className={`w-14 h-14 lg:w-16 lg:h-16 ${spec.color} rounded-full flex items-center justify-center text-2xl lg:text-3xl mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {spec.icon}
                </div>
                <p className="text-[#3c3c3c] font-medium text-xs lg:text-sm text-center leading-tight">
                  {spec.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Doctors */}
      <section id="doctors" className="py-12 lg:py-16 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">Top Doctors to Book</h2>
            <p className="text-gray-600 text-sm lg:text-base">Simply browse through our extensive list of trusted doctors.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {displayDoctors.map((doctor) => (
              <Link
                key={doctor.id}
                to="/login?role=patient"
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition group border hover:translate-y-[-5px]"
              >
                <div className="h-48 lg:h-56 bg-[#EAEFFF] flex items-center justify-center relative">
                  {doctor.profileImage ? (
                    <img 
                      src={`${API_BASE}${doctor.profileImage}`}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 lg:w-28 lg:h-28 bg-white rounded-full flex items-center justify-center shadow-md">
                      <span className="text-4xl lg:text-5xl font-bold text-[#5f6FFF]">{doctor.name.charAt(4)}</span>
                    </div>
                  )}
                  {doctor.available && (
                    <div className="absolute top-3 right-3 lg:top-4 lg:right-4 flex items-center gap-1.5 bg-white px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-full text-xs shadow-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-green-600 font-medium">Available</span>
                    </div>
                  )}
                </div>
                <div className="p-4 lg:p-5 bg-white">
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#5f6FFF] text-base lg:text-lg">{doctor.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{doctor.specialty}</p>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-8 lg:mt-10">
            <Link
              to="/login?role=patient"
              className="inline-block bg-[#EAEFFF] hover:bg-[#dce3ff] text-gray-700 px-8 lg:px-10 py-2.5 lg:py-3 rounded-full font-medium transition text-sm lg:text-base"
            >
              more
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#5f6FFF] rounded-2xl overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center">
              {/* Left Content */}
              <div className="p-8 lg:p-12 lg:w-1/2">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">Book Appointment</h2>
                <h3 className="text-2xl lg:text-3xl font-semibold text-white mb-6">With 3+ Trusted Doctors</h3>
                <Link
                  to="/register"
                  className="inline-flex items-center bg-white hover:bg-gray-100 text-gray-800 px-8 py-3 rounded-full font-medium transition"
                >
                  Create account
                </Link>
              </div>
              
              {/* Right - Doctor Image - Hidden on mobile */}
              <div className="hidden lg:flex lg:w-1/2 justify-end items-end">
                <img 
                  src={doctor2} 
                  alt="Doctor" 
                  className="h-[350px] w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Access Portal</h2>
            <p className="text-gray-600">Choose your role to access the system</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Patient */}
            <Link
              to="/login?role=patient"
              className="bg-white rounded-2xl p-6 sm:p-8 text-center hover:shadow-xl transition border group"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Patient</h3>
              <p className="text-gray-500 text-sm mb-4">Book appointments & manage health records</p>
              <span className="text-blue-600 font-medium">Login →</span>
            </Link>

            {/* Admin */}
            <Link
              to="/login?role=admin"
              className="bg-white rounded-2xl p-6 sm:p-8 text-center hover:shadow-xl transition border group"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Admin Panel</h3>
              <p className="text-gray-500 text-sm mb-4">Manage appointments & system settings</p>
              <span className="text-green-600 font-medium">Login →</span>
            </Link>

            {/* Doctor */}
            <Link
              to="/login?role=doctor"
              className="bg-white rounded-2xl p-6 sm:p-8 text-center hover:shadow-xl transition border group"
            >
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gynecologist</h3>
              <p className="text-gray-500 text-sm mb-4">View schedule & manage patients</p>
              <span className="text-purple-600 font-medium">Login →</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
