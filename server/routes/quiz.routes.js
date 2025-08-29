import express from "express";
import {
  generateQuiz,
  getQuizWithQuestions,
} from "../controllers/quiz.controller.js";
import userAuth from "../middlewares/auth.middleware.js";

const quizRouter = express.Router();

quizRouter.post("/generate", userAuth, generateQuiz);
quizRouter.get("/getQuiz", userAuth, getQuizWithQuestions);

export default quizRouter;
