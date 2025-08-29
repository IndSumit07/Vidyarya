import { ChatRoom } from "../models/chatroom.model.js";
import { Message } from "../models/message.model.js";

export const createRoom = async (req, res) => {
  try {
    const { name, isPrivate, userId } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });
    let inviteCode = undefined;
    if (isPrivate) {
      inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    const room = new ChatRoom({ name, isPrivate: !!isPrivate, createdBy: userId, members: [userId], inviteCode });
    await room.save();
    res.status(201).json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const listRooms = async (req, res) => {
  try {
    const { userId } = req.body;
    const rooms = await ChatRoom.find({
      $or: [
        { isPrivate: false },
        { isPrivate: true, members: userId },
      ],
    }).sort({ updatedAt: -1 });
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;
    const room = await ChatRoom.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    if (!room.members.some((m) => m.toString() === userId)) {
      room.members.push(userId);
      await room.save();
    }
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const joinByCode = async (req, res) => {
  try {
    const { code } = req.body;
    const { userId } = req.body;
    const room = await ChatRoom.findOne({ inviteCode: code.toUpperCase() });
    if (!room) return res.status(404).json({ success: false, message: "Invalid code" });
    if (!room.isPrivate) return res.status(400).json({ success: false, message: "Room is public; no code needed" });
    if (!room.members.some((m) => m.toString() === userId)) {
      room.members.push(userId);
      await room.save();
    }
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const postMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, senderName, text } = req.body;
    const room = await ChatRoom.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    const message = new Message({ roomId, senderId: userId, senderName, text });
    await message.save();
    // emit realtime to room
    const io = req.app.get("io");
    if (io) io.to(roomId.toString()).emit("chat-message", message);
    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete chat room (only creator can delete)
export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;

    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is the creator
    if (room.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the room creator can delete the room'
      });
    }

    // Delete all messages associated with the room
    await Message.deleteMany({ roomId });

    // Delete the room
    await ChatRoom.findByIdAndDelete(roomId);

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting chat room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete room',
      error: error.message
    });
  }
};


