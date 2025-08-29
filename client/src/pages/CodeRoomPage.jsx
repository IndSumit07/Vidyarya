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
  FaShare,
  FaTrash
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
  const [sendingMessage, setSendingMessage] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [executingCode, setExecutingCode] = useState(false);
  const [codeOutput, setCodeOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  const editorRef = useRef(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript', monaco: 'javascript' },
    { value: 'html', label: 'HTML', monaco: 'html' },
    { value: 'css', label: 'CSS', monaco: 'css' }
  ];

  const defaultCode = {
    javascript: '// Welcome to CodeRoom!\nconsole.log("Hello, World!");\n\n// Try some JavaScript examples:\nconst numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconsole.log("Original:", numbers);\nconsole.log("Doubled:", doubled);\n\n// Simple function\ndouble add(a, b) {\n    return a + b;\n}\nconsole.log("5 + 3 =", add(5, 3));',
    html: '<!DOCTYPE html>\n<html>\n<head>\n    <title>CodeRoom</title>\n    <style>\n        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }\n        .container { max-width: 800px; margin: 0 auto; }\n        .header { background: #2A4674; color: white; padding: 20px; border-radius: 10px; }\n        .content { margin-top: 20px; }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <div class="header">\n            <h1>🚀 Welcome to CodeRoom!</h1>\n            <p>This is a collaborative coding environment</p>\n        </div>\n        <div class="content">\n            <h2>Features:</h2>\n            <ul>\n                <li>Real-time collaboration</li>\n                <li>Live code execution</li>\n                <li>Instant chat</li>\n                <li>Multiple languages</li>\n            </ul>\n        </div>\n    </div>\n</body>\n</html>',
    css: '/* Welcome to CodeRoom! */\nbody {\n    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;\n    margin: 0;\n    padding: 0;\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    min-height: 100vh;\n}\n\n.container {\n    max-width: 1200px;\n    margin: 0 auto;\n    padding: 40px 20px;\n}\n\n.header {\n    text-align: center;\n    color: white;\n    margin-bottom: 40px;\n}\n\n.header h1 {\n    font-size: 3rem;\n    margin-bottom: 10px;\n    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);\n}\n\n.header p {\n    font-size: 1.2rem;\n    opacity: 0.9;\n}\n\n.features {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n    gap: 20px;\n}\n\n.feature-card {\n    background: white;\n    padding: 30px;\n    border-radius: 15px;\n    box-shadow: 0 10px 30px rgba(0,0,0,0.1);\n    text-align: center;\n    transition: transform 0.3s ease;\n}\n\n.feature-card:hover {\n    transform: translateY(-5px);\n}\n\n.feature-card h3 {\n    color: #2A4674;\n    margin-bottom: 15px;\n}\n\n.feature-card p {\n    color: #666;\n    line-height: 1.6;\n}'
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

    newSocket.on('user-typing', ({ userId, isTyping }) => {
      // Handle typing indicators if needed
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
    // Debounce the socket emission to prevent excessive updates
    if (socket && isConnected) {
      clearTimeout(window.codeChangeTimeout);
      window.codeChangeTimeout = setTimeout(() => {
        socket.emit('code-change', { roomId, code: value, userId: userData?._id });
      }, 300); // 300ms debounce
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      const response = await axios.post(`${backendUrl}/api/coderoom/${roomId}/messages`, {
        message: newMessage,
        messageType: 'text'
      }, {
        withCredentials: true
      });

      // Add message to local state immediately
      setMessages(prev => [...prev, response.data.data]);

      // Broadcast to other users
      if (socket && isConnected) {
        socket.emit('coderoom-message', { roomId, message: response.data.data });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
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

  const handleDeleteRoom = async () => {
    setDeletingRoom(true);
    try {
      await axios.delete(`${backendUrl}/api/coderoom/${roomId}`, {
        withCredentials: true
      });
      toast.success('Room deleted successfully');
      navigate('/coderooms');
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error(error.response?.data?.message || 'Failed to delete room');
    } finally {
      setDeletingRoom(false);
      setShowDeleteConfirm(false);
    }
  };

  const executeCode = async () => {
    setExecutingCode(true);
    setShowOutput(true);
    
    try {
      let output = '';
      
      switch (language) {
        case 'javascript':
          try {
            // Create a safe execution environment
            const originalConsoleLog = console.log;
            const logs = [];
            console.log = (...args) => {
              logs.push(args.join(' '));
            };
            
            // Execute the code
            eval(code);
            
            // Restore console.log
            console.log = originalConsoleLog;
            
            output = logs.join('\n');
          } catch (error) {
            output = `Error: ${error.message}`;
          }
          break;
          
        case 'html':
          // For HTML, show a preview
          output = 'HTML Preview:\n' + code;
          // Also create an iframe for live preview
          const iframe = document.createElement('iframe');
          iframe.srcdoc = code;
          iframe.style.width = '100%';
          iframe.style.height = '300px';
          iframe.style.border = '1px solid #ccc';
          iframe.style.borderRadius = '8px';
          document.getElementById('html-preview')?.appendChild(iframe);
          break;
          
        case 'css':
          // For CSS, show the styles
          output = 'CSS Styles:\n' + code;
          break;
          
        default:
          output = 'Language not supported for execution.';
      }
      
      setCodeOutput(output);
    } catch (error) {
      setCodeOutput(`Execution Error: ${error.message}`);
    } finally {
      setExecutingCode(false);
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
              onClick={executeCode}
              disabled={executingCode}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {executingCode ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FaPlay />
              )}
              {executingCode ? 'Running...' : 'Run Code'}
            </button>
            
                         {room.creator._id === userData?._id && (
               <button
                 onClick={() => setShowDeleteConfirm(true)}
                 disabled={deletingRoom}
                 className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition disabled:opacity-50"
               >
                 {deletingRoom ? (
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                 ) : (
                   <FaTrash />
                 )}
                 {deletingRoom ? 'Deleting...' : 'Delete Room'}
               </button>
             )}
             
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
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

          {/* Output Panel */}
          {showOutput && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaPlay className="text-[#2A4674]" />
                  <h3 className="font-semibold text-gray-800">Output</h3>
                </div>
                <button
                  onClick={() => setShowOutput(false)}
                  className="p-2 hover:bg-gray-200 rounded"
                >
                  ×
                </button>
              </div>
              <div className="p-4 h-[calc(100%-60px)] overflow-y-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-lg mb-4">
                  {codeOutput || 'No output yet. Run your code to see results.'}
                </pre>
                {language === 'html' && codeOutput && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Live Preview:</h4>
                    <div id="html-preview" className="border border-gray-300 rounded-lg overflow-hidden">
                      <iframe
                        srcDoc={code}
                        title="HTML Preview"
                        className="w-full h-64 border-0"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
                      disabled={sendingMessage}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A4674] focus:border-transparent disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={sendingMessage || !newMessage.trim()}
                      className="px-4 py-2 bg-[#2A4674] text-white rounded-lg hover:bg-[#1e3557] transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {sendingMessage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Sending...
                        </>
                      ) : (
                        'Send'
                      )}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
                 </div>
       </div>

       {/* Delete Confirmation Modal */}
       {showDeleteConfirm && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
             <div className="text-center">
               <FaTrash className="mx-auto text-4xl text-red-600 mb-4" />
               <h2 className="text-2xl font-bold mb-4">Delete Code Room</h2>
               <p className="text-gray-600 mb-6">
                 Are you sure you want to delete "{room.name}"? This action cannot be undone and will remove the room for all participants.
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

export default CodeRoomPage;
