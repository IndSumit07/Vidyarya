import React, { useContext, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const pastel = ["#fde2e4","#cde8ff","#d1fae5","#fef9c3","#e9d5ff","#c7d2fe","#ffd6a5"];

const startOfWeek = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day; // Sunday as start
  return new Date(date.setDate(diff));
};

const WeeklyTodosPage = () => {
  const { backendUrl } = useContext(AppContext);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const fetchTodos = async () => {
      const { data } = await axios.get(backendUrl + "/api/todo", { withCredentials: true });
      if (data.success) setTodos(data.todos);
    };
    fetchTodos();
  }, [backendUrl]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date());
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, []);

  const grouped = useMemo(() => {
    const map = new Map();
    weekDays.forEach((d) => {
      const key = d.toDateString();
      map.set(key, []);
    });
    todos.forEach((t) => {
      if (!t.dueDate) return; // only scheduled todos shown in weekly view
      const d = new Date(t.dueDate);
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString();
      if (map.has(key)) map.get(key).push(t);
    });
    return map;
  }, [todos, weekDays]);

  const toggleComplete = async (t) => {
    const { data } = await axios.put(`${backendUrl}/api/todo/${t._id}`, { isCompleted: !t.isCompleted }, { withCredentials: true });
    if (data.success) setTodos((prev) => prev.map((x) => (x._id === t._id ? data.todo : x)));
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="font-monts font-bold text-4xl text-white px-8 py-4 rounded-full bg-[#2A4674] mt-10">My Week</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {weekDays.map((d, i) => {
            const key = d.toDateString();
            const items = grouped.get(key) || [];
            return (
              <div key={key} className="rounded-2xl p-5 border border-[#2A4674]" style={{ background: pastel[i % pastel.length] }}>
                <div className="font-bold text-lg">{dayNames[d.getDay()]} <span className="text-sm">{d.toLocaleDateString()}</span></div>
                {items.length === 0 ? (
                  <div className="mt-4 text-sm text-black/70">No todos for this day.</div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {items.map((t) => (
                      <div key={t._id} className={`rounded-xl px-3 py-2 bg-white/70 flex items-center justify-between ${t.isCompleted?"line-through opacity-70":""}`}>
                        <div>
                          <div className="font-semibold">{t.title}</div>
                          {t.description && <div className="text-sm text-black/70">{t.description}</div>}
                        </div>
                        <button onClick={() => toggleComplete(t)} className="text-xs px-3 py-1 rounded-full border border-[#2A4674]">{t.isCompleted?"Undo":"Done"}</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyTodosPage;


