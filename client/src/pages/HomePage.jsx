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
        <div className="w-full max-w-5xl mx-auto px-6 my-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/quizzes" className="text-center px-6 py-5 border-2 border-[#2A4674] rounded-2xl font-bold hover:bg-[#2A4674] hover:text-white transition-colors">Quizzes</Link>
          <Link to="/chat" className="text-center px-6 py-5 border-2 border-[#2A4674] rounded-2xl font-bold hover:bg-[#2A4674] hover:text-white transition-colors">Chatrooms</Link>
          <Link to="/todos" className="text-center px-6 py-5 border-2 border-[#2A4674] rounded-2xl font-bold hover:bg-[#2A4674] hover:text-white transition-colors">Todos</Link>
          <Link to="/pdf-notes" className="text-center px-6 py-5 border-2 border-[#2A4674] rounded-2xl font-bold hover:bg-[#2A4674] hover:text-white transition-colors">📚 PDF Notes</Link>
          <Link to="/ai-processing" className="text-center px-6 py-5 border-2 border-[#2A4674] rounded-2xl font-bold hover:bg-[#2A4674] hover:text-white transition-colors">🧠 AI Processing</Link>
        </div>
    </div>
  )
}

export default HomePage