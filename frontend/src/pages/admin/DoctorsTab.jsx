import React, { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const DoctorCard = ({ doctor, onImageUpload, onUpdateDoctor, uploadingImage }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [specialty, setSpecialty] = useState(doctor.specialty || '')
  const [isFeatured, setIsFeatured] = useState(doctor.isFeatured || false)

  const handleSave = () => {
    onUpdateDoctor(doctor.id, { specialty, isFeatured })
    setIsEditing(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Doctor Image */}
      <div className="relative h-48 bg-[#EAEFFF] flex items-center justify-center">
        {doctor.profileImage ? (
          <img 
            src={`${API_BASE}${doctor.profileImage}`}
            alt={doctor.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md">
            <span className="text-4xl font-bold text-[#5f6FFF]">{doctor.name?.charAt(0)}</span>
          </div>
        )}
        
        {/* Upload Image Button */}
        <label className="absolute bottom-3 right-3 bg-white hover:bg-gray-50 text-[#5f6FFF] p-2 rounded-full shadow-md cursor-pointer transition">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onImageUpload(doctor.id, e.target.files[0])}
            disabled={uploadingImage === doctor.id}
          />
          {uploadingImage === doctor.id ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </label>
        
        {/* Featured Badge */}
        {doctor.isFeatured && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Featured
          </div>
        )}
      </div>
      
      {/* Doctor Info */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg">{doctor.name}</h3>
        <p className="text-sm text-gray-500 mb-3">{doctor.email}</p>
        
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#5f6FFF] focus:border-[#5f6FFF] outline-none"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-[#5f6FFF] rounded"
              />
              Show on Landing Page
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-[#5f6FFF] hover:bg-[#4f5fe0] text-white py-2 rounded-lg text-sm font-medium transition"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#5f6FFF] font-medium mb-3">
              {doctor.specialty || 'No specialty set'}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition"
            >
              Edit Details
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const DoctorsTab = ({ doctors, onImageUpload, onUpdateDoctor, uploadingImage }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Manage Doctors</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.length === 0 ? (
          <p className="text-gray-500 col-span-3 text-center py-8">No doctors found.</p>
        ) : (
          doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onImageUpload={onImageUpload}
              onUpdateDoctor={onUpdateDoctor}
              uploadingImage={uploadingImage}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default DoctorsTab
