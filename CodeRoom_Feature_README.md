# CodeRoom Feature - Collaborative Code Editor

## Overview
CodeRoom is a revolutionary collaborative coding feature that allows multiple users to code together in real-time with an integrated chat system. This feature is designed to enhance the learning experience by enabling students to collaborate on coding projects, debug together, and learn from each other.

## Features

### 🚀 Core Features
- **Real-time Collaborative Code Editor**: Multiple users can edit code simultaneously
- **Live Chat Integration**: Built-in chat system for communication during coding sessions
- **Room-based System**: Create or join rooms using unique 6-digit codes
- **Multiple Language Support**: HTML, CSS, JavaScript with live execution
- **Code Synchronization**: Real-time code updates across all participants
- **Room Management**: Create, join, and leave rooms with ease

### 💻 Supported Programming Languages
- **JavaScript** ⚡ - Full ES6+ support with live execution and console output
- **HTML** 🌐 - Complete HTML5 support with live preview
- **CSS** 🎨 - Modern CSS with syntax highlighting and style display

> **Note**: Only JavaScript, HTML, and CSS are currently supported for live execution. These languages can run directly in the browser without requiring compilation or backend services, providing the best user experience for real-time collaboration and immediate feedback.

### 🔧 Technical Features
- **Monaco Editor**: Professional-grade code editor (same as VS Code)
- **Socket.IO**: Real-time communication for code sync and chat
- **Responsive Design**: Works on desktop and mobile devices
- **Auto-save**: Automatic code saving to prevent data loss
- **Connection Status**: Real-time connection indicator

## How to Use

### Creating a Code Room
1. Navigate to the Code Rooms section from Dashboard or Services
2. Click "Create Room" button
3. Fill in the room details:
   - Room Name (required)
   - Description (optional)
   - Programming Language
   - Maximum Participants (2-20)
4. Click "Create Room"
5. Share the generated 6-digit room code with others

### Joining a Code Room
1. Navigate to Code Rooms section
2. Click "Join Room" button
3. Enter the 6-digit room code
4. Click "Join Room"

### Using the Code Editor
1. **Code Editing**: Start typing in the editor - changes sync in real-time
2. **Language Switching**: Use the dropdown to change programming language
3. **Chat**: Use the side panel to communicate with other participants
4. **Save Code**: Click the "Save" button to persist changes
5. **Copy Room Code**: Click "Copy Code" to share the room code

## Architecture

### Backend Components
- **Models**: `coderoom.model.js`, `coderoom-message.model.js`
- **Controller**: `coderoom.controller.js` - Handles all CRUD operations
- **Routes**: `coderoom.routes.js` - API endpoints
- **Socket.IO**: Real-time communication for code sync and chat

### Frontend Components
- **CodeRoomsPage**: Room listing and management
- **CodeRoomPage**: Main collaborative editor interface
- **Monaco Editor**: Professional code editor integration
- **Real-time Chat**: Integrated chat system

### API Endpoints
- `POST /api/coderoom/create` - Create new room
- `GET /api/coderoom/my-rooms` - Get user's rooms
- `POST /api/coderoom/join` - Join room by code
- `GET /api/coderoom/:roomId` - Get room details
- `PUT /api/coderoom/:roomId/code` - Update room code
- `GET /api/coderoom/:roomId/messages` - Get room messages
- `POST /api/coderoom/:roomId/messages` - Send message
- `DELETE /api/coderoom/:roomId/leave` - Leave room

### Socket Events
- `join-coderoom` - Join a code room
- `leave-coderoom` - Leave a code room
- `code-change` - Broadcast code changes
- `coderoom-message` - Broadcast chat messages

## Installation & Setup

### Prerequisites
- Node.js and npm installed
- MongoDB database
- Socket.IO server running

### Dependencies Added
```bash
# Frontend
npm install @monaco-editor/react uuid

# Backend (already included)
socket.io
```

### Configuration
1. Ensure MongoDB is running
2. Start the backend server: `npm run dev` (in server directory)
3. Start the frontend: `npm run dev` (in client directory)
4. Access the application and navigate to Code Rooms

## Security Features
- **Authentication Required**: All routes are protected
- **Room Access Control**: Only participants can access room content
- **User Validation**: Proper user authentication for all operations
- **Input Sanitization**: All inputs are validated and sanitized

## Performance Optimizations
- **Debounced Code Updates**: Prevents excessive socket emissions
- **Efficient Socket Management**: Proper connection handling
- **Optimized Database Queries**: Indexed queries for better performance
- **Lazy Loading**: Components load only when needed

## Future Enhancements
- **Code Execution**: Run code directly in the browser
- **File Upload**: Share files within rooms
- **Screen Sharing**: Visual collaboration features
- **Version Control**: Git integration for code history
- **Code Templates**: Pre-built templates for common tasks
- **Voice Chat**: Audio communication during coding sessions

## Troubleshooting

### Common Issues
1. **Connection Lost**: Check internet connection and server status
2. **Code Not Syncing**: Refresh the page and rejoin the room
3. **Chat Not Working**: Ensure Socket.IO connection is established
4. **Room Not Found**: Verify the room code is correct

### Debug Steps
1. Check browser console for errors
2. Verify server logs for backend issues
3. Ensure all dependencies are installed
4. Check MongoDB connection status

## Contributing
This feature is part of the Vidyarya Fullstack project. For contributions:
1. Follow the existing code style
2. Test thoroughly before submitting
3. Update documentation as needed
4. Ensure all tests pass

---

**Note**: This feature is designed to be a game-changer for collaborative learning and coding education. It provides a modern, real-time coding environment that enhances the learning experience significantly.
