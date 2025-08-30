import React, { useContext } from 'react'
import lectures from "../../public/lectures.png"
import { AppContext } from '../context/AppContext'
import { Link } from 'react-router-dom'
const Services = () => {
    const Card = ({ title, desc, to, bg, icon }) => (
  <Link to={to} className={`rounded-2xl p-6 shadow-md hover:shadow-lg transition border border-transparent hover:border-white`} style={{ background: bg }}>
    <div className='bg-transparent text-4xl mb-2'>
      {icon}
    </div>
    <div className="text-xl font-bold text-black bg-transparent">{title}</div>
    <div className="text-sm text-black/70 mt-2 bg-transparent">{desc}</div>
  </Link>
)
    const services = [
        {name: "Lectures",
            image: lectures
        },
        {name: "Make Schedules",
            image: lectures
        },
        {name: "E-Book Library",
            image: lectures
        },
        {name: "Performance Analysis",
            image: lectures
        },
        {name: "Generate Quizes",
            image: lectures
        },
        {name: "BrainStorm with Others",
            image: lectures
        },
        {name: "Lectures",
            image: lectures
        },

    ]
    const {userData} = useContext(AppContext)
  return (
    <div className='w-full h-[100vh] py-10 flex flex-col justify-start items-center'>
        <div className='flex justify-between items-center'>
            <h1 className='font-monts font-bold text-5xl text-white px-8 py-4 rounded-full bg-[#2A4674] mt-5'>Explore Our Services</h1>
            <div></div>
        </div>
        <main className="flex-1 bg-[#F5F5EF] p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <Card title="Lectures" desc="Watch recorded sessions and live classes." to="/lectures" bg="#fde2e4" icon="🎥"/>
          <Card title="Timetable" desc="Keep track of your schedule and deadlines." to="/timetable" bg="#cdb4db" icon="📆"/>
          <Card title="E-books Library" desc="Find textbooks, notes, and reading lists." to="/ebooks" bg="#d1fae5" icon="📚"/>
          <Card title="Performance analysis" desc="View grades, progress, and insights." to="/performance" bg="#e9d5ff" icon="📊"/>
          <Card title="Generate Quiz" desc="Create practice questions by topic." to="/generate-quiz" bg="#dbeafe" icon="🧩"/>
          <Card title="Ideas" desc="Save ideas and resources for later." to="/ideas" bg="#5b21b6" icon="💡"/>
          <Card title="My Todos" desc="View this week's todos by day." to="/todos/week" bg="#a7f3d0" icon="📆"/>
          <Card title="Discussions" desc="Ask questions and collaborate." to="/chat" bg="#a78bfa" icon="☁️"/>
          <Card title="Code Rooms" desc="Collaborative coding with real-time chat." to="/coderooms" bg="#fef3c7" icon="💻"/>
          <Card title="PDF Notes with AI" desc="Upload PDFs and get AI-generated study materials." to="/pdf-notes" bg="#fecaca" icon="🤖"/>
          <Card title="AI Processing" desc="Scan PDFs with AI to generate quizzes and flashcards." to="/ai-processing" bg="#fef3c7" icon="🧠"/>
        </div>
      </main>
    </div>
  )
}

export default Services