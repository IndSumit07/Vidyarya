import express from "express";
import userAuth from "../middlewares/auth.middleware.js";
import { createRoom, listRooms, joinRoom, getMessages, postMessage, joinByCode } from "../controllers/chat.controller.js";

const chatRouter = express.Router();

chatRouter.post("/rooms", userAuth, createRoom);
chatRouter.get("/rooms", userAuth, listRooms);
chatRouter.post("/rooms/:roomId/join", userAuth, joinRoom);
chatRouter.post("/rooms/join-by-code", userAuth, joinByCode);
chatRouter.get("/rooms/:roomId/messages", userAuth, getMessages);
chatRouter.post("/rooms/:roomId/messages", userAuth, postMessage);

export default chatRouter;


