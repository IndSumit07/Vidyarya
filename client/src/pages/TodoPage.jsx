import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import todobg from "../../public/todobg.png"
const TodoPage = () => {
  const { backendUrl } = useContext(AppContext);
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(backendUrl + "/api/todo", { withCredentials: true });
      data.success ? setTodos(data.todos) : toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTodos(); }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + "/api/todo", { title, description, dueDate }, { withCredentials: true });
      if (data.success) {
        setTitle(""); setDescription(""); setDueDate("");
        fetchTodos();
      } else toast.error(data.message);
    } catch (err) { toast.error(err.message); }
  };

  const toggleComplete = async (t) => {
    try {
      const { data } = await axios.put(`${backendUrl}/api/todo/${t._id}`, { isCompleted: !t.isCompleted }, { withCredentials: true });
      data.success ? fetchTodos() : toast.error(data.message);
    } catch (err) { toast.error(err.message); }
  };

  const remove = async (t) => {
    try {
      const { data } = await axios.delete(`${backendUrl}/api/todo/${t._id}`, { withCredentials: true });
      data.success ? fetchTodos() : toast.error(data.message);
    } catch (err) { toast.error(err.message); }
  };

  const toInputDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const startEdit = (t) => {
    setEditingId(t._id);
    setEditTitle(t.title || "");
    setEditDescription(t.description || "");
    setEditDueDate(toInputDate(t.dueDate));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditDueDate("");
  };

  const saveEdit = async (t) => {
    try {
      const payload = { title: editTitle, description: editDescription, dueDate: editDueDate };
      const { data } = await axios.put(`${backendUrl}/api/todo/${t._id}`, payload, { withCredentials: true });
      if (data.success) {
        cancelEdit();
        fetchTodos();
      } else {
        toast.error(data.message);
      }
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div style={{ backgroundImage: "url('../../public/todobg.png')" }} className="h-[calc(100vh-80px)] w-full bg-cover bg-start bg-no-repeat">
      <div className="w-full max-w-4xl mx-auto p-6 bg-transparent">
        

        <form onSubmit={addTodo} className="mt-64   grid grid-cols-1 gap-3 md:grid-cols-4 bg-transparent">
          <input className="px-4 py-3 border-2 border-[#2A4674] rounded-full" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <input className="px-4 py-3 border-2 border-[#2A4674] rounded-full" placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} />
          <input className="px-4 py-3 border-2 border-[#2A4674] rounded-full" type="date" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} />
          <button className="px-6 py-3 bg-[#2A4674] text-white rounded-full">Add</button>
        </form>

        {loading ? (
          <Loader label="Loading todos..." />
        ) : todos.length === 0 ? (
          <div className="mt-10 text-center text-gray-600">No todos yet. Add your first todo above.</div>
        ) : (
          <div className="mt-8 grid gap-4">
            {todos.map((t) => (
              <div key={t._id} className="border-2 border-[#2A4674] rounded-2xl p-5">
                {editingId === t._id ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                    <input className="px-4 py-3 border-2 border-[#2A4674] rounded-full" placeholder="Title" value={editTitle} onChange={(e)=>setEditTitle(e.target.value)} />
                    <input className="px-4 py-3 border-2 border-[#2A4674] rounded-full" placeholder="Description" value={editDescription} onChange={(e)=>setEditDescription(e.target.value)} />
                    <input className="px-4 py-3 border-2 border-[#2A4674] rounded-full" type="date" value={editDueDate} onChange={(e)=>setEditDueDate(e.target.value)} />
                    <div className="flex gap-2 justify-end">
                      <button onClick={()=>saveEdit(t)} className="px-4 py-2 bg-[#2A4674] text-white rounded-full">Save</button>
                      <button onClick={cancelEdit} className="px-4 py-2 border-2 border-[#2A4674] rounded-full">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">{t.title}</div>
                      {t.description && <div className="text-gray-600">{t.description}</div>}
                      {t.dueDate && <div className="text-gray-600">Due: {new Date(t.dueDate).toLocaleDateString()}</div>}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={()=>toggleComplete(t)} className={`px-4 py-2 rounded-full border-2 ${t.isCompleted?"bg-green-600 text-white border-green-600":"border-[#2A4674]"}`}>{t.isCompleted?"Completed":"Mark Done"}</button>
                      <button onClick={()=>startEdit(t)} className="px-4 py-2 rounded-full border-2 border-[#2A4674]">Edit</button>
                      <button onClick={()=>remove(t)} className="px-4 py-2 rounded-full border-2 border-red-600 text-red-600">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoPage;


