import express from 'express';
import userAuth from '../middlewares/auth.middleware.js';
import {
  createCodeRoom,
  getUserCodeRooms,
  joinCodeRoom,
  getRoomDetails,
  updateRoomCode,
  getRoomMessages,
  sendMessage,
  leaveRoom
} from '../controllers/coderoom.controller.js';

const router = express.Router();

// All routes are protected
router.use(userAuth);

// Create a new code room
router.post('/create', createCodeRoom);

// Get user's code rooms
router.get('/my-rooms', getUserCodeRooms);

// Join a code room
router.post('/join', joinCodeRoom);

// Get room details
router.get('/:roomId', getRoomDetails);

// Update room code
router.put('/:roomId/code', updateRoomCode);

// Get room messages
router.get('/:roomId/messages', getRoomMessages);

// Send message to room
router.post('/:roomId/messages', sendMessage);

// Leave room
router.delete('/:roomId/leave', leaveRoom);

export default router;
