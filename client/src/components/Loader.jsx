import React from 'react'

const Loader = ({ label = 'Loading...' }) => {
  return (
    <div className="w-full flex items-center justify-center py-10 bg-transparent">
      <div className="flex items-center gap-3 bg-transparent">
        <span className="inline-block w-5 h-5 rounded-full border-2 border-white/50 border-t-transparent animate-spin bg-transparent"></span>
        <span className="text-white/50 font-semibold bg-transparent">{label}</span>
      </div>
    </div>
  )
}

export default Loader


