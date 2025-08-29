import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.config.js";
import userRouter from "./routes/user.routes.js";
import quizRouter from "./routes/quiz.routes.js";
import chatRouter from "./routes/chat.routes.js";
import todoRouter from "./routes/todo.routes.js";
import pdfRouter from "./routes/pdf.routes.js";
import timetableRouter from "./routes/timetable.routes.js";
import coderoomRouter from "./routes/coderoom.routes.js";
import http from "http";
// socket.io will be required at runtime; ensure dependency installed
import { Server as SocketIOServer } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:5173", "https://vidyarya.vercel.app"],
    credentials: true,
  },
});
// make io available to controllers
app.set("io", io);
const PORT = process.env.PORT || 4000;
connectDB();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", "https://vidyarya.vercel.app"],
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.use("/api/auth", userRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/chat", chatRouter);
app.use("/api/todo", todoRouter);
app.use("/api/pdf", pdfRouter);
app.use("/api/timetable", timetableRouter);
app.use("/api/coderoom", coderoomRouter);

io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId }) => {
    socket.join(roomId);
  });
  socket.on("chat-message", async ({ roomId, message }) => {
    // defer to REST controller to persist via HTTP in frontend, but echo realtime
    io.to(roomId).emit("chat-message", message);
  });
  
  // CodeRoom socket events
  socket.on("join-coderoom", ({ roomId }) => {
    socket.join(`coderoom-${roomId}`);
  });
  
  socket.on("leave-coderoom", ({ roomId }) => {
    socket.leave(`coderoom-${roomId}`);
  });
  
  socket.on("code-change", ({ roomId, code, userId }) => {
    socket.to(`coderoom-${roomId}`).emit("code-updated", { code, userId });
  });
  
  socket.on("coderoom-message", ({ roomId, message }) => {
    socket.to(`coderoom-${roomId}`).emit("new-message", message);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
