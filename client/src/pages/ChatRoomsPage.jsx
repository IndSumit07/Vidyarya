import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const ChatRoomsPage = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/chat/rooms", { withCredentials: true });
      data.success ? setRooms(data.rooms) : toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const createRoom = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + "/api/chat/rooms", { name, isPrivate }, { withCredentials: true });
      if (data.success) {
        setName("");
        setIsPrivate(false);
        fetchRooms();
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="w-full max-w-5xl mx-auto p-6">
        <h1 className="font-monts font-bold text-4xl text-white px-8 py-4 rounded-full bg-[#2A4674] mt-10">Chat Rooms</h1>

        <form onSubmit={createRoom} className="mt-8 flex gap-3">
          <input className="px-4 py-3 border-2 border-[#2A4674] rounded-full flex-1" placeholder="New room name" value={name} onChange={(e)=>setName(e.target.value)} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isPrivate} onChange={()=>setIsPrivate(!isPrivate)} />
            <span>Private</span>
          </label>
          <button className="px-6 py-3 bg-[#2A4674] text-white rounded-full">Create</button>
        </form>

        {rooms.length === 0 ? (
          <div className="mt-10 text-center text-gray-600">No chatrooms yet. Create the first one above.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {rooms.map((r)=> (
              <div key={r._id} className="border-2 border-[#2A4674] rounded-2xl p-5">
                <h3 className="font-bold text-xl">{r.name}</h3>
                <p className="text-gray-600">{r.isPrivate?"Private":"Public"}</p>
                <div className="mt-3">
                  <Link to={`/chat/${r._id}`} className="px-4 py-2 bg-[#2A4674] text-white rounded-full">Join</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoomsPage;
