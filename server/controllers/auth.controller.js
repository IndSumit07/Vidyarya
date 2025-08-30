import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import transporter from "../config/nodemailer.js";

// In-memory storage for OTPs (in production, use Redis or database)
const otpStore = new Map();

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }
    let user = await User.findOne({ email });
    if (user) {
      console.log(`User with email ${email} already exists.`);
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 60 * 60 * 1000,
    });
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Vidyarya",
      text: `Welcome to Vidyarya. Your account has been created with email id: ${email}`,
    };
    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ success: true, message: "User registered successfully!" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Oops! An error occurred: ${error.message}`,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and Password is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched)
      return res.json({ success: false, message: "Invalid Password" });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 60 * 60 * 1000,
    });
    return res.json({ success: true, message: "Login Successfull" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Oops! An error occurred: ${error.message}`,
    });
  }
};

export const isAuthenticated = async (req, res) => {
  try {
    // Check if userId exists in request body (set by auth middleware)
    if (!req.body.userId) {
      return res.json({ success: false, message: "Not authenticated" });
    }
    
    // Check if user exists in database
    const user = await User.findById(req.body.userId).select('-password');
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('isAuthenticated error:', error);
    return res.json({ success: false, message: error.message });
  }
};

export const getUserData = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, userData: user });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error fetching user data: ${error.message}`,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist"
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration (5 minutes)
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // Send OTP via email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Password Reset OTP - Vidyarya",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2A4674;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You have requested to reset your password. Use the following OTP to verify your identity:</p>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #2A4674; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p><strong>This OTP will expire in 5 minutes.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>Team Vidyarya</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "OTP sent successfully to your email"
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again."
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    const storedData = otpStore.get(email);
    
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired. Please request a new one."
      });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one."
      });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please check and try again."
      });
    }

    return res.json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP. Please try again."
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Verify OTP again
    const storedData = otpStore.get(email);
    
    if (!storedData || storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please request a new one."
      });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one."
      });
    }

    // Find user and update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Remove OTP from store
    otpStore.delete(email);

    // Send confirmation email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Password Reset Successful - Vidyarya",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2A4674;">Password Reset Successful</h2>
          <p>Hello ${user.name},</p>
          <p>Your password has been successfully reset.</p>
          <p>You can now login to your account with your new password.</p>
          <p>If you didn't perform this action, please contact our support team immediately.</p>
          <p>Best regards,<br>Team Vidyarya</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again."
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the authentication cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: '/'
    });

    return res.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: "Error during logout"
    });
  }
};
