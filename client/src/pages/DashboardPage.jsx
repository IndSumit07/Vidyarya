import React from 'react'
import { Link } from 'react-router-dom'

const Card = ({ title, desc, to, bg }) => (
  <Link to={to} className={`rounded-2xl p-6 shadow-md hover:shadow-lg transition border border-transparent hover:border-white`} style={{ background: bg }}>
    <div className="text-xl font-bold text-black">{title}</div>
    <div className="text-sm text-black/70 mt-2">{desc}</div>
  </Link>
)

const DashboardPage = () => {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2A4674] text-white p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">A</div>
          <div>
            <div className="font-bold">Student</div>
            <div className="text-sm opacity-80">Dashboard</div>
          </div>
        </div>
        <nav className="space-y-3">
          <Link to="/dashboard" className="block hover:underline">Dashboard</Link>
          <Link to="/lectures" className="block hover:underline">Lectures</Link>
          <Link to="/ebooks" className="block hover:underline">E-Books</Link>
          <Link to="/quizzes" className="block hover:underline">Quizzes</Link>
          <Link to="/performance" className="block hover:underline">Performance</Link>
          <Link to="/chat" className="block hover:underline">Chatrooms</Link>
          <Link to="/todos" className="block hover:underline">Todos</Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-[#F5F5EF] p-10">
        <h1 className="text-3xl font-extrabold text-[#2A4674]">Explore All Sections</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <Card title="Lectures" desc="Watch recorded sessions and live classes." to="/lectures" bg="#fde2e4" />
          <Card title="Timetable" desc="Keep track of your schedule and deadlines." to="/timetable" bg="#cdb4db" />
          <Card title="E-books Library" desc="Find textbooks, notes, and reading lists." to="/ebooks" bg="#d1fae5" />
          <Card title="Performance analysis" desc="View grades, progress, and insights." to="/performance" bg="#e9d5ff" />
          <Card title="Generate Quiz" desc="Create practice questions by topic." to="/generate-quiz" bg="#dbeafe" />
          <Card title="Ideas" desc="Save ideas and resources for later." to="/ideas" bg="#5b21b6" />
          <Card title="My Todos" desc="View this week's todos by day." to="/todos/week" bg="#a7f3d0" />
          <Card title="Discussions" desc="Ask questions and collaborate." to="/chat" bg="#a78bfa" />
          <Card title="Customize" desc="Pick icons and themes for your portal." to="/customize" bg="#fef08a" />
        </div>
      </main>
    </div>
  )
}

export default DashboardPage


