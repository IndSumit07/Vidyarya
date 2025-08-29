import CodeRoom from '../models/coderoom.model.js';
import CodeRoomMessage from '../models/coderoom-message.model.js';
import { User } from '../models/user.model.js';

// Create a new code room
export const createCodeRoom = async (req, res) => {
  try {
    const { name, description, language, maxParticipants } = req.body;
    const userId = req.body.userId;

    // Generate unique room code
    const roomCode = await CodeRoom.generateRoomCode();

    const newRoom = new CodeRoom({
      roomCode,
      name,
      description,
      creator: userId,
      language: language || 'javascript',
      maxParticipants: maxParticipants || 10,
      participants: [{ user: userId }]
    });

    await newRoom.save();

    // Get user data for the message
    const user = await User.findById(userId);
    
    // Create welcome message
    const welcomeMessage = new CodeRoomMessage({
      roomId: newRoom._id,
      sender: userId,
      message: `${user?.name || 'Someone'} created this room`,
      messageType: 'system'
    });
    await welcomeMessage.save();

    res.status(201).json({
      success: true,
      message: 'Code room created successfully',
      room: newRoom
    });
  } catch (error) {
    console.error('Error creating code room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create code room',
      error: error.message
    });
  }
};

// Get all code rooms for a user
export const getUserCodeRooms = async (req, res) => {
  try {
    const userId = req.body.userId;

    const rooms = await CodeRoom.find({
      'participants.user': userId,
      isActive: true
    }).populate('creator', 'name email')
      .populate('participants.user', 'name email')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      rooms
    });
  } catch (error) {
    console.error('Error fetching user code rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch code rooms',
      error: error.message
    });
  }
};

// Join a code room by room code
export const joinCodeRoom = async (req, res) => {
  try {
    const { roomCode } = req.body;
    const userId = req.body.userId;

    const room = await CodeRoom.findOne({ 
      roomCode: roomCode.toUpperCase(),
      isActive: true 
    }).populate('creator', 'name email')
      .populate('participants.user', 'name email');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found or inactive'
      });
    }

    // Check if user is already a participant
    const isAlreadyParticipant = room.participants.some(
      p => p.user._id.toString() === userId
    );

    if (isAlreadyParticipant) {
      return res.status(200).json({
        success: true,
        message: 'Already a participant in this room',
        room
      });
    }

    // Check if room is full
    if (room.participants.length >= room.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Room is full'
      });
    }

    // Add user to participants
    room.participants.push({ user: userId });
    await room.save();

    // Get user data for the message
    const user = await User.findById(userId);
    
    // Create join message
    const joinMessage = new CodeRoomMessage({
      roomId: room._id,
      sender: userId,
      message: `${user?.name || 'Someone'} joined the room`,
      messageType: 'system'
    });
    await joinMessage.save();

    res.status(200).json({
      success: true,
      message: 'Successfully joined the room',
      room
    });
  } catch (error) {
    console.error('Error joining code room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join room',
      error: error.message
    });
  }
};

// Get room details by ID
export const getRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.body.userId;

    const room = await CodeRoom.findById(roomId)
      .populate('creator', 'name email')
      .populate('participants.user', 'name email');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is a participant
    const isParticipant = room.participants.some(
      p => p.user._id.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a participant in this room'
      });
    }

    res.status(200).json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Error fetching room details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room details',
      error: error.message
    });
  }
};

// Update room code
export const updateRoomCode = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { code } = req.body;
    const userId = req.body.userId;

    const room = await CodeRoom.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is a participant
    const isParticipant = room.participants.some(
      p => p.user.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    room.code = code;
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Code updated successfully',
      room
    });
  } catch (error) {
    console.error('Error updating room code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update code',
      error: error.message
    });
  }
};

// Get room messages
export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.body.userId;

    // Check if user is a participant
    const room = await CodeRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const isParticipant = room.participants.some(
      p => p.user.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const messages = await CodeRoomMessage.find({ roomId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching room messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// Send message to room
export const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { message, messageType = 'text' } = req.body;
    const userId = req.body.userId;

    // Check if user is a participant
    const room = await CodeRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const isParticipant = room.participants.some(
      p => p.user.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const newMessage = new CodeRoomMessage({
      roomId,
      sender: userId,
      message,
      messageType
    });

    await newMessage.save();

    const populatedMessage = await CodeRoomMessage.findById(newMessage._id)
      .populate('sender', 'name email');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Leave room
export const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.body.userId;

    const room = await CodeRoom.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Remove user from participants
    room.participants = room.participants.filter(
      p => p.user.toString() !== userId
    );

    await room.save();

    // Get user data for the message
    const user = await User.findById(userId);
    
    // Create leave message
    const leaveMessage = new CodeRoomMessage({
      roomId: room._id,
      sender: userId,
      message: `${user?.name || 'Someone'} left the room`,
      messageType: 'system'
    });
    await leaveMessage.save();

    res.status(200).json({
      success: true,
      message: 'Successfully left the room'
    });
  } catch (error) {
    console.error('Error leaving room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave room',
      error: error.message
    });
  }
};

// Delete room (only creator can delete)
export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.body.userId;

    const room = await CodeRoom.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is the creator
    if (room.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the room creator can delete the room'
      });
    }

    // Delete all messages associated with the room
    await CodeRoomMessage.deleteMany({ roomId });

    // Delete the room
    await CodeRoom.findByIdAndDelete(roomId);

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete room',
      error: error.message
    });
  }
};
