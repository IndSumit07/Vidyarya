import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { Icons } from 'react-toastify'

const Card = ({ title, desc, to, bg, icon }) => (
  <Link to={to} className={`rounded-2xl p-6 shadow-md hover:shadow-lg transition border border-transparent hover:border-white`} style={{ background: bg }}>
    <div className='bg-transparent text-4xl mb-2'>
      {icon}
    </div>
    <div className="text-xl font-bold text-black bg-transparent">{title}</div>
    <div className="text-sm text-black/70 mt-2 bg-transparent">{desc}</div>
  </Link>
)

const DashboardPage = () => {
  const {userData} = useContext(AppContext)
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2A4674] text-white p-6 space-y-6">
        <div className="flex items-center gap-3 bg-transparent">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold text-white font-chakra">{userData.name.charAt(0).toUpperCase()}</div>
          <div className='bg-transparent'>
            <div className="font-bold bg-transparent text-white text-xl font-chakra">{userData.name}</div>
            <div className="text-sm opacity-80 bg-transparent text-white/50">Dashboard</div>
          </div>
        </div>
        <nav className="   bg-transparent">
          <Link to="/dashboard" className="block bg-transparent text-white font-chakra text-lg font-semibold hover:bg-[#2d589e] px-5 py-4 rounded-xl">Dashboard</Link>
          <Link to="/lectures" className="block bg-transparent text-white font-chakra text-lg font-semibold hover:bg-[#2d589e] px-5 py-4 rounded-xl">Lectures</Link>
          <Link to="/ebooks" className="block bg-transparent text-white font-chakra text-lg font-semibold hover:bg-[#2d589e] px-5 py-4 rounded-xl">E-Books</Link>
          <Link to="/quizzes" className="block bg-transparent text-white font-chakra text-lg font-semibold hover:bg-[#2d589e] px-5 py-4 rounded-xl">Quizzes</Link>
          <Link to="/performance" className="block bg-transparent text-white font-chakra text-lg font-semibold hover:bg-[#2d589e] px-5 py-4 rounded-xl">Performance</Link>
          <Link to="/chat" className="block bg-transparent text-white font-chakra text-lg font-semibold hover:bg-[#2d589e] px-5 py-4 rounded-xl">Chatrooms</Link>
          <Link to="/todos" className="block bg-transparent text-white font-chakra text-lg font-semibold hover:bg-[#2d589e] px-5 py-4 rounded-xl">Todos</Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-[#F5F5EF] p-10">
        <h1 className="text-4xl font-extrabold text-[#2A4674] font-monts">{userData.name+"'s Data"}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <Card title="Lectures" desc="Watch recorded sessions and live classes." to="/lectures" bg="#fde2e4" icon="🎥"/>
          <Card title="Timetable" desc="Keep track of your schedule and deadlines." to="/timetable" bg="#cdb4db" icon="📆"/>
          <Card title="E-books Library" desc="Find textbooks, notes, and reading lists." to="/ebooks" bg="#d1fae5" icon="📚"/>
          <Card title="Performance analysis" desc="View grades, progress, and insights." to="/performance" bg="#e9d5ff" icon="📊"/>
          <Card title="Generate Quiz" desc="Create practice questions by topic." to="/generate-quiz" bg="#dbeafe" icon="🧩"/>
          <Card title="Ideas" desc="Save ideas and resources for later." to="/ideas" bg="#5b21b6" icon="💡"/>
          <Card title="My Todos" desc="View this week's todos by day." to="/todos/week" bg="#a7f3d0" icon="📆"/>
          <Card title="Discussions" desc="Ask questions and collaborate." to="/chat" bg="#a78bfa" icon="☁️"/>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage


