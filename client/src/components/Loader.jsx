import React from 'react'

const Loader = ({ label = 'Loading...' }) => {
  return (
    <div className="w-full flex items-center justify-center py-10">
      <div className="flex items-center gap-3">
        <span className="inline-block w-5 h-5 rounded-full border-2 border-[#2A4674] border-t-transparent animate-spin"></span>
        <span className="text-[#2A4674] font-semibold">{label}</span>
      </div>
    </div>
  )
}

export default Loader


