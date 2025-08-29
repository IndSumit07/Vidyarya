import mongoose from 'mongoose';

const coderoomMessageSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodeRoom',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'code', 'system'],
    default: 'text'
  }
}, {
  timestamps: true
});

const CodeRoomMessage = mongoose.model('CodeRoomMessage', coderoomMessageSchema);

export default CodeRoomMessage;
