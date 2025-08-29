import mongoose from "mongoose";

const quizContentSchema = new mongoose.Schema(
  {
    quizID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    questions: [
      {
        questionText: {
          type: String,
          required: true,
        },
        options: [
          {
            type: String,
            required: true,
          },
        ],
        answer: {
          type: String, // if single correct answer
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const QuizContent = mongoose.model("QuizContent", quizContentSchema);
