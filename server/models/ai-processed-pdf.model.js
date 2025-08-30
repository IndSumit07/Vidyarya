import mongoose from 'mongoose';

const aiProcessedPdfSchema = new mongoose.Schema({
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
  subject: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  uploaderName: {
    type: String,
    required: true,
    trim: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  
  // AI Generated Content
  summary: {
    type: String,
    required: true,
    trim: true
  },
  quizzes: [{
    question: {
      type: String,
      required: true,
      trim: true
    },
    options: [{
      type: String,
      required: true,
      trim: true
    }],
    correctAnswer: {
      type: String,
      required: true,
      trim: true
    },
    explanation: {
      type: String,
      trim: true
    }
  }],
  flashcards: [{
    front: {
      type: String,
      required: true,
      trim: true
    },
    back: {
      type: String,
      required: true,
      trim: true
    }
  }],
  keyPoints: [{
    type: String,
    trim: true
  }],
  
  // Processing Status
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  errorMessage: {
    type: String,
    trim: true
  },
  
  // Processing Info
  processedAt: {
    type: Date,
    default: Date.now
  },
  processingTime: {
    type: Number, // in milliseconds
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
aiProcessedPdfSchema.index({ subject: 1 });
aiProcessedPdfSchema.index({ status: 1 });
aiProcessedPdfSchema.index({ uploaderName: 1 });
aiProcessedPdfSchema.index({ createdAt: -1 });

const AIProcessedPDF = mongoose.model('AIProcessedPDF', aiProcessedPdfSchema);
export default AIProcessedPDF;
