import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.config.js";
import userRouter from "./routes/user.routes.js";
import quizRouter from "./routes/quiz.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;
connectDB();

app.use(cors({ credentials: true, origin: ["http://localhost:5173"] }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.use("/api/auth", userRouter);
app.use("/api/quiz", quizRouter);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
