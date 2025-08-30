import mongoose from 'mongoose';

const pdfAiContentSchema = new mongoose.Schema({
  pdfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PDF',
    required: true
  },
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
  generatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  errorMessage: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
pdfAiContentSchema.index({ pdfId: 1 });
pdfAiContentSchema.index({ status: 1 });

const PDFAiContent = mongoose.model('PDFAiContent', pdfAiContentSchema);
export default PDFAiContent;
