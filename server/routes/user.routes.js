import express from "express";
import {
  isAuthenticated,
  login,
  register,
} from "../controllers/auth.controller.js";
import userAuth from "../middlewares/auth.middleware.js";
import { getUserData, updateProfile } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/is-auth", userAuth, isAuthenticated);

userRouter.get("/data", userAuth, getUserData);
userRouter.post("/update-profile", userAuth, updateProfile);

export default userRouter;
