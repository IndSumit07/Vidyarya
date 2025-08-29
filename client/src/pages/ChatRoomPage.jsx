import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import Loader from "../components/Loader";
import { FaTrash, FaArrowLeft } from "react-icons/fa";

const ChatRoomPage = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState(null);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchRoomDetails = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/chat/rooms`, { withCredentials: true });
      if (data.success) {
        const currentRoom = data.rooms.find(r => r._id === roomId);
        setRoom(currentRoom);
      }
    } catch (err) {
      console.error('Error fetching room details:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/chat/rooms/${roomId}/messages`, { withCredentials: true });
      data.success ? setMessages(data.messages) : toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  const joinRoom = async () => {
    try {
      await axios.post(`${backendUrl}/api/chat/rooms/${roomId}/join`, {}, { withCredentials: true });
    } catch (err) {
      // ignore silently
    }
  };

  useEffect(() => {
    joinRoom();
    fetchMessages();
    fetchRoomDetails();
    // connect socket
    const socket = io(backendUrl, { withCredentials: true });
    socketRef.current = socket;
    socket.emit("join-room", { roomId });
    socket.on("chat-message", (message) => {
      if (message.roomId === roomId || message.roomId?._id === roomId) {
        setMessages((m) => [...m, message]);
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    const payload = { senderName: userData?.name || "User", text };
    try {
      setSending(true);
      const { data } = await axios.post(`${backendUrl}/api/chat/rooms/${roomId}/messages`, payload, { withCredentials: true });
      if (data.success) {
        // avoid local double-add; rely on socket event
        setText("");
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const getInitial = (name) => (name?.[0] || "").toUpperCase();

  const handleDeleteRoom = async () => {
    setDeletingRoom(true);
    try {
      await axios.delete(`${backendUrl}/api/chat/rooms/${roomId}`, {
        withCredentials: true
      });
      toast.success('Room deleted successfully');
      navigate('/chat');
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error(error.response?.data?.message || 'Failed to delete room');
    } finally {
      setDeletingRoom(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="w-full max-w-3xl mx-auto p-6">
        {/* Room Header */}
        {room && (
          <div className="bg-white border-2 border-[#2A4674] rounded-2xl p-4 mt-8 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/chat')}
                  className="p-2 text-[#2A4674] hover:bg-gray-100 rounded-full transition"
                >
                  <FaArrowLeft />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-[#2A4674]">{room.name}</h2>
                  <p className="text-sm text-gray-600">
                    {room.isPrivate ? 'Private Room' : 'Public Room'}
                    {room.isPrivate && room.inviteCode && (
                      <span className="ml-2 text-[#2A4674] font-mono">Code: {room.inviteCode}</span>
                    )}
                  </p>
                </div>
              </div>
              
              {room.createdBy === userData?._id && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deletingRoom}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition disabled:opacity-50"
                  title="Delete Room"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          </div>
        )}
        
        <div className="border-2 border-[#2A4674] rounded-2xl p-4 h-[70vh] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-3" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            {loading ? (
              <Loader label="Loading messages..." />
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-600 mt-6">No messages yet. Say hello!</div>
            ) : (
              messages.map((m) => {
                const isSelf = m.senderName === (userData?.name || "User");
                return (
                  <div key={m._id} className={`flex items-start gap-3 px-1 ${isSelf?"justify-end":"justify-start"}`}>
                    {!isSelf && (
                      <div className="w-10 h-10 rounded-full bg-[#2A4674] text-white flex items-center justify-center font-bold">
                        {getInitial(m.senderName)}
                      </div>
                    )}
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow ${isSelf?"bg-[#2A4674] text-white":"bg-white text-[#2A4674]"}`}>
                      <div className={`font-semibold bg-transparent ${isSelf?"text-white/90":"text-[#2A4674]"}`}>{m.senderName}</div>
                      <div className="mt-0.5 leading-relaxed bg-transparent">{m.text}</div>
                    </div>
                    {isSelf && (
                      <div className="w-10 h-10 rounded-full bg-[#2A4674] text-white flex items-center justify-center font-bold">
                        {getInitial(m.senderName)}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={send} className="mt-3 flex gap-3">
            <input className="flex-1 px-4 py-3 border-2 border-[#2A4674] rounded-full" placeholder="Type message" value={text} onChange={(e)=>setText(e.target.value)} disabled={sending} />
            <button disabled={sending} className={`px-6 py-3 rounded-full text-white ${sending?"opacity-60 cursor-not-allowed":""}`} style={{ backgroundColor: '#2A4674' }}>
              {sending ? 'Sending…' : 'Send'}
            </button>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <FaTrash className="mx-auto text-4xl text-red-600 mb-4" />
              <h2 className="text-2xl font-bold mb-4">Delete Chat Room</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{room?.name}"? This action cannot be undone and will remove the room for all participants.
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deletingRoom}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRoom}
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
  );
};

export default ChatRoomPage;
