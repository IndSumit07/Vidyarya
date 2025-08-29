import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";

const ChatRoomsPage = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(backendUrl + "/api/chat/rooms", { withCredentials: true });
      data.success ? setRooms(data.rooms) : toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
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
        if (data.room.isPrivate && data.room.inviteCode) {
          toast.success(`Invite code: ${data.room.inviteCode}`);
        }
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const joinByCode = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + "/api/chat/rooms/join-by-code", { code: joinCode }, { withCredentials: true });
      if (data.success) {
        toast.success("Joined room");
        setJoinCode("");
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

        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <form onSubmit={createRoom} className="flex gap-3 items-center">
            <input className="px-4 py-3 border-2 border-[#2A4674] rounded-full flex-1" placeholder="New room name" value={name} onChange={(e)=>setName(e.target.value)} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isPrivate} onChange={()=>setIsPrivate(!isPrivate)} />
              <span>Private</span>
            </label>
            <button className="px-6 py-3 bg-[#2A4674] text-white rounded-full">Create</button>
          </form>

          <form onSubmit={joinByCode} className="flex gap-3 items-center">
            <input className="px-4 py-3 border-2 border-[#2A4674] rounded-full flex-1" placeholder="Enter invite code" value={joinCode} onChange={(e)=>setJoinCode(e.target.value.toUpperCase())} />
            <button className="px-6 py-3 bg-[#2A4674] text-white rounded-full">Join</button>
          </form>
        </div>

        {loading ? (
          <Loader label="Loading chatrooms..." />
        ) : rooms.length === 0 ? (
          <div className="mt-10 text-center text-gray-600">No chatrooms yet. Create the first one above.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {rooms.map((r)=> (
              <div key={r._id} className="border-2 border-[#2A4674] rounded-2xl p-5">
                <h3 className="font-bold text-xl">{r.name}</h3>
                <p className="text-gray-600">{r.isPrivate?"Private":"Public"}</p>
                {r.isPrivate && r.inviteCode && (
                  <div className="mt-2 text-sm text-[#2A4674]">Invite code: <span className="font-semibold">{r.inviteCode}</span></div>
                )}
                <div className="mt-3">
                  <Link to={`/chat/${r._id}`} className="px-4 py-2 bg-[#2A4674] text-white rounded-full">Enter</Link>
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
