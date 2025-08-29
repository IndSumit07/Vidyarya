import express from "express";
import {
  generateQuiz,
  getQuizWithQuestions,
  listQuizzes,
  submitQuizAnswers,
  getQuizResult,
} from "../controllers/quiz.controller.js";
import userAuth from "../middlewares/auth.middleware.js";

const quizRouter = express.Router();

quizRouter.post("/generate", userAuth, generateQuiz);
quizRouter.get("/list", userAuth, listQuizzes);
quizRouter.get("/:quizID", userAuth, getQuizWithQuestions);
quizRouter.post("/:quizID/submit", userAuth, submitQuizAnswers);
quizRouter.get("/attempt/:attemptID", userAuth, getQuizResult);

export default quizRouter;
