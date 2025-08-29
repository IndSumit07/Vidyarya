import React, { useContext } from "react";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { userData } = useContext(AppContext);

  return (
    <div>
      <Navbar />
      <div className="w-full max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 border-2 border-[#2A4674] rounded-2xl p-5 h-fit">
          <div className="flex items-center gap-4 bg-transparent">
            <div className="w-14 h-14 rounded-full bg-[#2A4674] text-white flex items-center justify-center text-2xl font-bold bg-transparent">
              {userData?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="bg-transparent">
              <div className="font-bold text-lg bg-transparent">{userData?.name}</div>
              <div className="text-gray-600 text-sm bg-transparent">{userData?.email}</div>
              <div className="text-gray-600 text-sm capitalize bg-transparent">{userData?.role}</div>
            </div>
          </div>

          <nav className="mt-6 grid gap-2">
            <Link to="/quizzes" className="px-4 py-2 rounded-full border-2 border-[#2A4674] text-center">Your Quizzes</Link>
            <Link to="/chat" className="px-4 py-2 rounded-full border-2 border-[#2A4674] text-center">Your Chatrooms</Link>
            <Link to="/coderooms" className="px-4 py-2 rounded-full border-2 border-[#2A4674] text-center">Your Code Rooms</Link>
            <Link to="/todos" className="px-4 py-2 rounded-full border-2 border-[#2A4674] text-center">Your Todos</Link>
          </nav>
        </aside>

        <main className="md:col-span-3 grid gap-6">
          <h1 className="font-monts font-bold text-4xl text-white px-8 py-4 rounded-full bg-[#2A4674]">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border-2 border-[#2A4674] rounded-2xl p-5">
              <h3 className="font-bold text-xl">Your Quizzes</h3>
              <p className="text-gray-600 mt-2">Create and attempt quizzes.</p>
              <Link to="/quizzes" className="inline-block mt-4 px-4 py-2 bg-[#2A4674] text-white rounded-full">Open</Link>
            </div>
            <div className="border-2 border-[#2A4674] rounded-2xl p-5">
              <h3 className="font-bold text-xl">Your Chatrooms</h3>
              <p className="text-gray-600 mt-2">Create or join chatrooms.</p>
              <Link to="/chat" className="inline-block mt-4 px-4 py-2 bg-[#2A4674] text-white rounded-full">Open</Link>
            </div>
            <div className="border-2 border-[#2A4674] rounded-2xl p-5">
              <h3 className="font-bold text-xl">Your Code Rooms</h3>
              <p className="text-gray-600 mt-2">Collaborative coding with real-time chat.</p>
              <Link to="/coderooms" className="inline-block mt-4 px-4 py-2 bg-[#2A4674] text-white rounded-full">Open</Link>
            </div>
            <div className="border-2 border-[#2A4674] rounded-2xl p-5">
              <h3 className="font-bold text-xl">Your Todos</h3>
              <p className="text-gray-600 mt-2">Manage your tasks.</p>
              <Link to="/todos" className="inline-block mt-4 px-4 py-2 bg-[#2A4674] text-white rounded-full">Open</Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
