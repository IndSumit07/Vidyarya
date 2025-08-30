import express from "express";
import {
  isAuthenticated,
  login,
  register,
  forgotPassword,
  verifyOTP,
  resetPassword,
  logout,
} from "../controllers/auth.controller.js";
import userAuth from "../middlewares/auth.middleware.js";
import { getUserData, updateProfile } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/is-auth", userAuth, isAuthenticated);
userRouter.post("/logout", logout);

// Forgot password routes
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/verify-otp", verifyOTP);
userRouter.post("/reset-password", resetPassword);

userRouter.get("/data", userAuth, getUserData);
userRouter.post("/update-profile", userAuth, updateProfile);

export default userRouter;
