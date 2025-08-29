import mongoose from 'mongoose';

const timetableEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    default: ''
  },
  endTime: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAllDay: {
    type: Boolean,
    default: false
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'weekly'
  }
}, { 
  timestamps: true 
});

// Index for efficient querying
timetableEventSchema.index({ userId: 1, date: 1 });
timetableEventSchema.index({ date: 1 });

const TimetableEvent = mongoose.model('TimetableEvent', timetableEventSchema);

export default TimetableEvent;
