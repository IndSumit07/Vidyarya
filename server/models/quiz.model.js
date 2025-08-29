import mongoose from "mongoose";

// Define the schema for Quiz
const quizSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Quiz name is required"],
    },
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    topicList: [
      {
        type: String, // Assuming these are the chapter PDF links
        required: true,
      },
    ],
    quizContent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizContent",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    completedTrue: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create and export the Quiz model
export const Quiz = mongoose.model("Quiz", quizSchema);
