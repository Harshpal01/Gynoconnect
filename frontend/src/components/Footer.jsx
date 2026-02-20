import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white text-gray-600 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo & About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-8 h-8 text-[#5f6FFF]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.5L17.5 8 12 11.5 6.5 8 12 4.5zM6 9.5l5 3v6l-5-3v-6zm12 0v6l-5 3v-6l5-3z"/>
              </svg>
              <h3 className="text-2xl font-bold text-[#5f6FFF]">Gynoconnect</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Modern appointment scheduling system for gynecological services. We provide efficient, secure, and user-friendly healthcare booking solutions.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-gray-800 font-semibold mb-4 uppercase">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-[#5f6FFF] transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/#about" className="hover:text-[#5f6FFF] transition">
                  About us
                </Link>
              </li>
              <li>
                <Link to="/#doctors" className="hover:text-[#5f6FFF] transition">
                  Doctors
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-[#5f6FFF] transition">
                  Privacy policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gray-800 font-semibold mb-4 uppercase">Get In Touch</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="tel:+254700036474" className="hover:text-[#5f6FFF] transition">
                  +254700036474
                </a>
              </li>
              <li>
                <a href="mailto:gynoconnectclinic@gmail.com" className="hover:text-[#5f6FFF] transition">
                  gynoconnectclinic@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-center text-gray-500">
            Copyright {currentYear} @ Gynoconnect - All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
