import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { FaCode, FaPlus, FaUsers, FaClock, FaSignInAlt, FaTrash } from 'react-icons/fa';

const CodeRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    language: 'javascript',
    maxParticipants: 10
  });
  const { userData, backendUrl } = useContext(AppContext);

  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '⚡' },
    { value: 'html', label: 'HTML', icon: '🌐' },
    { value: 'css', label: 'CSS', icon: '🎨' }
  ];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/coderoom/my-rooms`, {
        withCredentials: true
      });
      setRooms(response.data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setCreatingRoom(true);
    try {
      const response = await axios.post(`${backendUrl}/api/coderoom/create`, createForm, {
        withCredentials: true
      });
      toast.success('Room created successfully!');
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        description: '',
        language: 'javascript',
        maxParticipants: 10
      });
      fetchRooms();
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error(error.response?.data?.message || 'Failed to create room');
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }

    setJoiningRoom(true);
    try {
      const response = await axios.post(`${backendUrl}/api/coderoom/join`, { roomCode: joinCode }, {
        withCredentials: true
      });
      toast.success('Successfully joined the room!');
      setShowJoinModal(false);
      setJoinCode('');
      fetchRooms();
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error(error.response?.data?.message || 'Failed to join room');
    } finally {
      setJoiningRoom(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    setDeletingRoom(true);
    try {
      await axios.delete(`${backendUrl}/api/coderoom/${roomId}`, {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLanguageIcon = (language) => {
    const lang = languages.find(l => l.value === language);
    return lang ? lang.icon : '💻';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A4674]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-monts font-bold text-4xl text-white px-8 py-4 rounded-full bg-[#2A4674]">
            Code Rooms
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowJoinModal(true)}
              className="bg-transparent flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
            >
              <FaSignInAlt />
              Join Room
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#2A4674] text-white rounded-full hover:bg-[#1e3557] transition"
            >
              <FaPlus />
              Create Room
            </button>
          </div>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-16">
            <FaCode className="mx-auto text-6xl text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Code Rooms Yet</h3>
            <p className="text-gray-500 mb-6">Create your first code room or join an existing one to start collaborating!</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-[#2A4674] text-white rounded-full hover:bg-[#1e3557] transition"
              >
                Create Your First Room
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
              >
                Join a Room
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room._id} className="bg-white rounded-2xl shadow-lg border-2 border-[#2A4674] p-6 hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getLanguageIcon(room.language)}</span>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{room.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{room.language}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Room Code</div>
                    <div className="font-mono font-bold text-lg text-[#2A4674]">{room.roomCode}</div>
                  </div>
                </div>

                {room.description && (
                  <p className="text-gray-600 text-sm mb-4">{room.description}</p>
                )}

                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FaUsers />
                    <span>{room.participants.length}/{room.maxParticipants}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaClock />
                    <span>{formatDate(room.updatedAt)}</span>
                  </div>
                </div>

                                 <div className="flex items-center justify-between">
                   <div className="text-xs text-gray-500">
                     Created by {room.creator.name}
                   </div>
                   <div className="flex items-center gap-2">
                     {room.creator._id === userData?._id && (
                       <button
                         onClick={() => setRoomToDelete(room)}
                         disabled={deletingRoom}
                         className="p-2 text-red-600 hover:bg-red-50 rounded-full transition disabled:opacity-50"
                         title="Delete Room"
                       >
                         <FaTrash size={14} />
                       </button>
                     )}
                     <Link
                       to={`/coderoom/${room._id}`}
                       className="px-4 py-2 bg-[#2A4674] text-white rounded-full text-sm hover:bg-[#1e3557] transition"
                     >
                       Enter Room
                     </Link>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6 text-center">Create Code Room</h2>
            <form onSubmit={handleCreateRoom}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Name *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A4674] focus:border-transparent"
                  placeholder="Enter room name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A4674] focus:border-transparent"
                  placeholder="Enter room description"
                  rows="3"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programming Language
                </label>
                <select
                  value={createForm.language}
                  onChange={(e) => setCreateForm({...createForm, language: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A4674] focus:border-transparent"
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.icon} {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={createForm.maxParticipants}
                  onChange={(e) => setCreateForm({...createForm, maxParticipants: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A4674] focus:border-transparent"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingRoom}
                  className="flex-1 px-4 py-2 bg-[#2A4674] text-white rounded-lg hover:bg-[#1e3557] transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creatingRoom ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Room'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6 text-center">Join Code Room</h2>
            <form onSubmit={handleJoinRoom}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Code *
                </label>
                <input
                  type="text"
                  required
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A4674] focus:border-transparent font-mono text-center text-lg"
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joiningRoom}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {joiningRoom ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Joining...
                    </>
                  ) : (
                    'Join Room'
                  )}
                </button>
              </div>
            </form>
          </div>
                 </div>
       )}

       {/* Delete Confirmation Modal */}
       {roomToDelete && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
             <div className="text-center">
               <FaTrash className="mx-auto text-4xl text-red-600 mb-4" />
               <h2 className="text-2xl font-bold mb-4">Delete Code Room</h2>
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
   );
 };

export default CodeRoomsPage;
