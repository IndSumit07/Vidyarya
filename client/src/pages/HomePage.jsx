import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Services from '../components/Services'
import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <div>
        <Hero/>
        <Services/>
        <div className="w-full max-w-5xl mx-auto px-6 my-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/quizzes" className="text-center px-6 py-5 border-2 border-[#2A4674] rounded-2xl font-bold hover:bg-[#2A4674] hover:text-white">Quizzes</Link>
          <Link to="/chat" className="text-center px-6 py-5 border-2 border-[#2A4674] rounded-2xl font-bold hover:bg-[#2A4674] hover:text-white">Chatrooms</Link>
          <Link to="/todos" className="text-center px-6 py-5 border-2 border-[#2A4674] rounded-2xl font-bold hover:bg-[#2A4674] hover:text-white">Todos</Link>
        </div>
    </div>
  )
}

export default HomePage