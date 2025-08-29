import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { AppContext } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { 
  FaUsers, 
  FaCopy, 
  FaSignOutAlt, 
  FaCode, 
  FaComments,
  FaPlay,
  FaSave,
  FaShare
} from 'react-icons/fa';

const CodeRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { userData, backendUrl } = useContext(AppContext);
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const editorRef = useRef(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript', monaco: 'javascript' },
    { value: 'html', label: 'HTML', monaco: 'html' },
    { value: 'css', label: 'CSS', monaco: 'css' },
    { value: 'python', label: 'Python', monaco: 'python' },
    { value: 'java', label: 'Java', monaco: 'java' },
    { value: 'c', label: 'C', monaco: 'c' },
    { value: 'cpp', label: 'C++', monaco: 'cpp' }
  ];

  const defaultCode = {
    javascript: '// Welcome to CodeRoom!\nconsole.log("Hello, World!");',
    html: '<!DOCTYPE html>\n<html>\n<head>\n    <title>CodeRoom</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>',
    css: '/* Welcome to CodeRoom! */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background-color: #f0f0f0;\n}',
    python: '# Welcome to CodeRoom!\nprint("Hello, World!")',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
    cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}'
  };

  useEffect(() => {
    fetchRoomDetails();
    initializeSocket();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSocket = () => {
    const newSocket = io(backendUrl, {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-coderoom', { roomId });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('code-updated', ({ code: updatedCode, userId }) => {
      if (userId !== userData?._id) {
        setCode(updatedCode);
      }
    });

    newSocket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);
  };

  const fetchRoomDetails = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/coderoom/${roomId}`, {
        withCredentials: true
      });
      setRoom(response.data.room);
      setCode(response.data.room.code || defaultCode[response.data.room.language]);
      setLanguage(response.data.room.language);
      fetchMessages();
    } catch (error) {
      console.error('Error fetching room details:', error);
      toast.error('Failed to load room');
      navigate('/coderooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/coderoom/${roomId}/messages`, {
        withCredentials: true
      });
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleCodeChange = (value) => {
    setCode(value);
    if (socket && isConnected) {
      socket.emit('code-change', { roomId, code: value, userId: userData?._id });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(`${backendUrl}/api/coderoom/${roomId}/messages`, {
        message: newMessage,
        messageType: 'text'
      }, {
        withCredentials: true
      });

      if (socket && isConnected) {
        socket.emit('coderoom-message', { roomId, message: response.data.data });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleSaveCode = async () => {
    try {
      await axios.put(`${backendUrl}/api/coderoom/${roomId}/code`, { code }, {
        withCredentials: true
      });
      toast.success('Code saved successfully!');
    } catch (error) {
      console.error('Error saving code:', error);
      toast.error('Failed to save code');
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await axios.delete(`${backendUrl}/api/coderoom/${roomId}/leave`, {
        withCredentials: true
      });
      toast.success('Left the room successfully');
      navigate('/coderooms');
    } catch (error) {
      console.error('Error leaving room:', error);
      toast.error('Failed to leave room');
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room?.roomCode);
    toast.success('Room code copied to clipboard!');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getLanguageConfig = (lang) => {
    const langConfig = languages.find(l => l.value === lang);
    return langConfig ? langConfig.monaco : 'javascript';
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

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Room Not Found</h2>
            <button
              onClick={() => navigate('/coderooms')}
              className="px-6 py-3 bg-[#2A4674] text-white rounded-full hover:bg-[#1e3557] transition"
            >
              Back to Code Rooms
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FaCode className="text-2xl text-[#2A4674]" />
              <h1 className="text-2xl font-bold text-gray-800">{room.name}</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="capitalize">{language}</span>
              <span>•</span>
              <span className="font-mono">{room.roomCode}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaUsers />
              <span>{room.participants.length} participants</span>
            </div>
            
            <button
              onClick={copyRoomCode}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <FaCopy />
              Copy Code
            </button>
            
            <button
              onClick={handleSaveCode}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FaSave />
              Save
            </button>
            
            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <FaSignOutAlt />
              Leave
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Code Editor */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-gray-800">Code Editor</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-500">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="h-full">
              <Editor
                height="100%"
                language={getLanguageConfig(language)}
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  roundedSelection: false,
                  readOnly: false,
                  cursorStyle: 'line',
                  automaticLayout: true,
                }}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
              />
            </div>
          </div>

          {/* Chat Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaComments className="text-[#2A4674]" />
                <h3 className="font-semibold text-gray-800">Chat</h3>
              </div>
              
              <button
                onClick={() => setShowChat(!showChat)}
                className="lg:hidden p-2 hover:bg-gray-200 rounded"
              >
                {showChat ? '−' : '+'}
              </button>
            </div>
            
            {showChat && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 h-[calc(100%-120px)]">
                  {messages.map((message, index) => (
                    <div key={index} className={`mb-4 ${message.messageType === 'system' ? 'text-center' : ''}`}>
                      {message.messageType === 'system' ? (
                        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-block">
                          {message.message}
                        </div>
                      ) : (
                        <div className={`flex ${message.sender._id === userData?._id ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs px-4 py-2 rounded-lg ${
                            message.sender._id === userData?._id 
                              ? 'bg-[#2A4674] text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <div className="text-xs font-medium mb-1">
                              {message.sender.name}
                            </div>
                            <div className="text-sm">{message.message}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A4674] focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#2A4674] text-white rounded-lg hover:bg-[#1e3557] transition"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeRoomPage;
