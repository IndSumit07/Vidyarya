import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const ChatRoomPage = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/chat/rooms/${roomId}/messages`, { withCredentials: true });
      data.success ? setMessages(data.messages) : toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
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
  }, [roomId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const payload = { senderName: userData?.name || "User", text };
    try {
      const { data } = await axios.post(`${backendUrl}/api/chat/rooms/${roomId}/messages`, payload, { withCredentials: true });
      if (data.success) {
        setMessages((m) => [...m, data.message]);
        setText("");
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getInitial = (name) => (name?.[0] || "").toUpperCase();

  return (
    <div>
      <Navbar />
      <div className="w-full max-w-3xl mx-auto p-6">
        <div className="border-2 border-[#2A4674] rounded-2xl p-4 mt-8 h-[70vh] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-600 mt-6">No messages yet. Say hello!</div>
            ) : (
              messages.map((m) => (
                <div key={m._id} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2A4674] text-white flex items-center justify-center font-bold">
                    {getInitial(m.senderName)}
                  </div>
                  <div>
                    <div className="font-semibold">{m.senderName}</div>
                    <div>{m.text}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={send} className="mt-3 flex gap-3">
            <input className="flex-1 px-4 py-3 border-2 border-[#2A4674] rounded-full" placeholder="Type message" value={text} onChange={(e)=>setText(e.target.value)} />
            <button className="px-6 py-3 bg-[#2A4674] text-white rounded-full">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatRoomPage;
