import { ChatRoom } from "../models/chatroom.model.js";
import { Message } from "../models/message.model.js";

export const createRoom = async (req, res) => {
  try {
    const { name, isPrivate, userId } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });
    const room = new ChatRoom({ name, isPrivate: !!isPrivate, createdBy: userId, members: [userId] });
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
    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


