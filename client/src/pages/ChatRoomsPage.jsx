import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { FaTrash } from "react-icons/fa";

const ChatRoomsPage = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

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

  const handleDeleteRoom = async (roomId) => {
    setDeletingRoom(true);
    try {
      await axios.delete(`${backendUrl}/api/chat/rooms/${roomId}`, {
        withCredentials: true
      });
      toast.success('Room deleted successfully');
      setRoomToDelete(null);
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error(error.response?.data?.message || 'Failed to delete room');
    } finally {
      setDeletingRoom(false);
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
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Created by {r.createdBy === userData?._id ? 'You' : 'Someone'}
                  </div>
                  <div className="flex items-center gap-2">
                    {r.createdBy === userData?._id && (
                      <button
                        onClick={() => setRoomToDelete(r)}
                        disabled={deletingRoom}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition disabled:opacity-50"
                        title="Delete Room"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                    <Link to={`/chat/${r._id}`} className="px-4 py-2 bg-[#2A4674] text-white rounded-full">Enter</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {roomToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <FaTrash className="mx-auto text-4xl text-red-600 mb-4" />
                <h2 className="text-2xl font-bold mb-4">Delete Chat Room</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{roomToDelete.name}"? This action cannot be undone and will remove the room for all participants.
                </p>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setRoomToDelete(null)}
                    disabled={deletingRoom}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(roomToDelete._id)}
                    disabled={deletingRoom}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deletingRoom ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete Room'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoomsPage;
