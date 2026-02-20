import React from 'react'
import doctorImg from '../assets/doctors.png' // Replace with your actual image path

const AboutUs = () => {
  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <h1 className="text-center text-base sm:text-lg tracking-[0.2em] text-gray-500 font-medium">
          ABOUT <span className="font-semibold text-gray-700">US</span>
        </h1>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div className="flex justify-center md:justify-start">
            <img
              src={doctorImg}
              alt="Two doctors"
              className="w-full max-w-md object-cover rounded border border-gray-200"
            />
          </div>

          <div>
            <p className="text-sm sm:text-[15px] text-gray-600 leading-7">
              Welcome to GynoConnect, your trusted partner in managing your healthcare needs conveniently and efficiently. At GynoConnect, we understand the challenges individuals face when it comes to scheduling doctor appointments and managing their health records.
            </p>

            <p className="mt-5 text-sm sm:text-[15px] text-gray-600 leading-7">
              GynoConnect is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating the latest advancements to improve user experience and deliver superior service. Whether you’re booking your first appointment or managing ongoing care, GynoConnect is here to support you every step of the way.
            </p>

            <h2 className="mt-6 font-semibold text-gray-900 text-sm">Our Vision</h2>
            <p className="mt-3 text-sm sm:text-[15px] text-gray-600 leading-7">
              Our vision at GynoConnect is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need, when you need it.
            </p>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-sm sm:text-base font-semibold tracking-[0.12em] text-gray-900 uppercase">Why Choose Us</h2>
          <div className="mt-5 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="group p-10 md:p-12 transition-colors duration-200 hover:bg-[#5f6FFF]">
                <p className="font-semibold text-sm tracking-wide text-gray-900 group-hover:text-white">EFFICIENCY:</p>
                <p className="mt-4 text-sm leading-relaxed text-gray-600 group-hover:text-white/90">
                  Streamlined appointment scheduling that fits into your busy lifestyle.
                </p>
              </div>
              <div className="group p-10 md:p-12 border-t md:border-t-0 md:border-l border-gray-200 transition-colors duration-200 hover:bg-[#5f6FFF]">
                <p className="font-semibold text-sm tracking-wide text-gray-900 group-hover:text-white">CONVENIENCE:</p>
                <p className="mt-4 text-sm leading-relaxed text-gray-600 group-hover:text-white/90">
                  Access to a network of trusted healthcare professionals in your area.
                </p>
              </div>
              <div className="group p-10 md:p-12 border-t md:border-t-0 md:border-l border-gray-200 transition-colors duration-200 hover:bg-[#5f6FFF]">
                <p className="font-semibold text-sm tracking-wide text-gray-900 group-hover:text-white">PERSONALIZATION:</p>
                <p className="mt-4 text-sm leading-relaxed text-gray-600 group-hover:text-white/90">
                  Tailored recommendations and reminders to help you stay on top of your health.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default AboutUs
