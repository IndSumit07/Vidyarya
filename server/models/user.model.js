import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // User details
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    sparse: true,
  },
  password: {
    type: String,
  },
  quizes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },
  ],
  mobileNumber: {
    type: String,
    unique: true,
    sparse: true, // Ensures mobileNumber can be optional for non-NumberBased logins
  },
  profileImageName: {
    type: String,
    trim: true,
  },
  userProfession: {
    type: String,
  },
  // Role and account type
  role: {
    type: String,
    enum: ["student", "teacher"],
    required: true,
  },
  otp: {
    type: String,
    default: null, // OTP for password reset
  },
  otpExpiry: {
    type: Date,
    default: null, // Expiry time for OTP
  },
  isVerified: {
    type: Boolean,
    default: false, // Tracks whether OTP is verified
  },
  verifiedEmail: {
    type: String,
    trim: true,
    default: null, // This will temporarily store the verified email until it's officially updated in `email`
  },
});

// Create and export the User model
export const User = mongoose.model("User", userSchema);
