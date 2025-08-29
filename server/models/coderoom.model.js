import mongoose from 'mongoose';

const coderoomSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  language: {
    type: String,
    enum: ['html', 'css', 'javascript', 'java', 'python', 'c', 'cpp'],
    default: 'javascript'
  },
  code: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxParticipants: {
    type: Number,
    default: 10
  }
}, {
  timestamps: true
});

// Generate unique room code
coderoomSchema.statics.generateRoomCode = async function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let roomCode;
  let isUnique = false;
  
  while (!isUnique) {
    roomCode = '';
    for (let i = 0; i < 6; i++) {
      roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const existingRoom = await this.findOne({ roomCode });
    if (!existingRoom) {
      isUnique = true;
    }
  }
  
  return roomCode;
};

const CodeRoom = mongoose.model('CodeRoom', coderoomSchema);

export default CodeRoom;
