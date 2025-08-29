import { Quiz } from "../models/quiz.model.js";
import { QuizContent } from "../models/quiz.content.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Create Quiz + AI-generated questions
export const generateQuiz = async (req, res) => {
  try {
    const {
      name,
      description,
      isActive,
      isPrivate,
      topicList,
      subject,
      numQuestions,
      userId,
    } = req.body;

    if (!name || !subject || !userId) {
      return res.status(400).json({
        success: false,
        message: "name, subject and userId are required",
      });
    }

    // 1️⃣ Save Quiz metadata
    const quiz = new Quiz({
      name,
      description,
      isActive,
      isPrivate,
      topicList,
      createdBy: userId,
      subject,
    });
    await quiz.save();

    // 2️⃣ Generate Questions using Gemini
    const prompt = `
    Generate ${numQuestions || 5} multiple choice questions on "${subject}".
    Format response ONLY as a valid JSON array, no explanation:
    [
      {
        "questionText": "string",
        "options": ["opt1", "opt2", "opt3", "opt4"],
        "answer": "correct_option"
      }
    ]
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    // 3️⃣ Clean + Parse JSON
    let generatedQuestions;
    try {
      let cleaned = rawText.replace(/```json|```/g, "").trim();
      generatedQuestions = JSON.parse(cleaned);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Error parsing Gemini response",
        rawText,
        error: err.message,
      });
    }

    // 4️⃣ Save Questions in QuizContent
    const quizContent = new QuizContent({
      quizID: quiz._id,
      questions: generatedQuestions,
    });
    await quizContent.save();

    res.status(201).json({
      success: true,
      message: "Quiz generated successfully",
      quiz,
      quizContent,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error generating quiz",
      error: err.message,
    });
  }
};

// ✅ Get Quiz + Questions
export const getQuizWithQuestions = async (req, res) => {
  try {
    const { quizID } = req.params;

    const quiz = await Quiz.findById(quizID);
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    const quizContent = await QuizContent.findOne({ quizID });
    res.status(200).json({
      success: true,
      quiz,
      questions: quizContent ? quizContent.questions : [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching quiz",
      error: err.message,
    });
  }
};
