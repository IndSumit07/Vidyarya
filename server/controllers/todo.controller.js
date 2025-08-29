import { Todo } from "../models/todo.model.js";

export const createTodo = async (req, res) => {
  try {
    const { userId, title, description, dueDate } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });
    const todo = new Todo({ userId, title, description, dueDate });
    await todo.save();
    res.status(201).json({ success: true, todo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const listTodos = async (req, res) => {
  try {
    const { userId } = req.body;
    const todos = await Todo.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, todos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTodo = async (req, res) => {
  try {
    const { todoId } = req.params;
    const { title, description, dueDate, isCompleted } = req.body;
    const todo = await Todo.findById(todoId);
    if (!todo) return res.status(404).json({ success: false, message: "Todo not found" });
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (dueDate !== undefined) todo.dueDate = dueDate;
    if (isCompleted !== undefined) todo.isCompleted = isCompleted;
    await todo.save();
    res.json({ success: true, todo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const { todoId } = req.params;
    await Todo.findByIdAndDelete(todoId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


