import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/auth/forgot-password`, { email });
      
      if (response.data.success) {
        toast.success('OTP sent to your email!');
        setStep(2);
        startCountdown();
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/auth/verify-otp`, { email, otp });
      
      if (response.data.success) {
        toast.success('OTP verified successfully!');
        setStep(3);
      } else {
        toast.error(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error.response?.data?.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        email,
        otp,
        newPassword
      });
      
      if (response.data.success) {
        toast.success('Password reset successfully! Please login with your new password.');
        // Redirect to login page
        window.location.href = '/login';
      } else {
        toast.error(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resendOTP = async () => {
    if (countdown > 0) return;
    
    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/auth/forgot-password`, { email });
      
      if (response.data.success) {
        toast.success('OTP resent to your email!');
        startCountdown();
      } else {
        toast.error(response.data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <FiArrowLeft size={16} />
            Back to Login
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password</h1>
          <p className="text-gray-600">
            {step === 1 && "Enter your email to receive a verification code"}
            {step === 2 && "Enter the 6-digit code sent to your email"}
            {step === 3 && "Create a new password for your account"}
          </p>
        </div>

        {/* Step 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter the 6-digit code sent to {email}
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={resendOTP}
                disabled={countdown > 0 || loading}
                className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Progress Steps */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-3 h-3 rounded-full ${
                  step >= stepNumber ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

