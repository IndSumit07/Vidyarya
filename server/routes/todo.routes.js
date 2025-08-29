import express from "express";
import userAuth from "../middlewares/auth.middleware.js";
import { createTodo, listTodos, updateTodo, deleteTodo } from "../controllers/todo.controller.js";

const todoRouter = express.Router();

todoRouter.post("/", userAuth, createTodo);
todoRouter.get("/", userAuth, listTodos);
todoRouter.put("/:todoId", userAuth, updateTodo);
todoRouter.delete("/:todoId", userAuth, deleteTodo);

export default todoRouter;


