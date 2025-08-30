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
    <div className="min-h-screen bg-[#F5F5EF] flex items-center justify-center p-4">
      <div className="bg-[#2A4674] rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 bg-transparent">
          <Link to="/login" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 bg-transparent">
            <FiArrowLeft size={16} className='bg-transparent'/>
            Back to Login
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
          <p className="text-white">
            {step === 1 && "Enter your email to receive a verification code"}
            {step === 2 && "Enter the 6-digit code sent to your email"}
            {step === 3 && "Create a new password for your account"}
          </p>
        </div>

        {/* Step 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="bg-transparent">
              <label className="block text-sm font-medium text-white mb-4 bg-transparent">
                Email Address
              </label>
                
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-white/20 rounded-xl bg-[#2A4674] text-gray-200 placeholder-gray-500 focus:bg-[#152b50] outline-none focus:ring-2 focus:ring-gray-500 transition-all shadow-sm"
                  placeholder="Enter your email"
                  required
                />
            
            <div className='bg-transparent'>
              <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#152b50] text-white py-3 rounded-lg font-semibold hover:bg-[#2A4674] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-8 border-2 border-white/20"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
            </div>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className=" bg-transparent">
              <label className="block text-sm font-medium text-white mb-4 bg-transparent ">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 border border-white/20 rounded-xl bg-[#2A4674] text-gray-200 placeholder-gray-500 focus:bg-[#152b50] outline-none focus:ring-2 focus:ring-gray-500 transition-all shadow-sm"
                placeholder="000000"
                maxLength={6}
                required
              />
              <p className="text-sm text-white mt-4 mb-4">
                Enter the 6-digit code sent to {email}
              </p>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[#152b50] hover:bg-[#2A4674] text-white font-semibold rounded-xl shadow-lg transition-all duration-200 border border-white/20 mb-4"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <div className="text-center bg-transparent">
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
          <form onSubmit={handleResetPassword} className="bg-transparent">
              <label className="block text-sm font-medium text-white mb-4 bg-transparent">
                New Password
                
              </label>
              <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-white/20 rounded-xl bg-[#2A4674] text-gray-200 placeholder-gray-500 focus:bg-[#152b50] outline-none focus:ring-2 focus:ring-gray-500 transition-all shadow-sm mb-8"
                  required
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>

              <label className="block text-sm font-medium text-white mb-4 bg-transparent">
                Confirm New Password
              </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-white/20 rounded-xl bg-[#2A4674] text-gray-200 placeholder-gray-500 focus:bg-[#152b50] outline-none focus:ring-2 focus:ring-gray-500 transition-all shadow-sm mb-8"
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
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[#152b50] hover:bg-[#2A4674] text-white font-semibold rounded-xl shadow-lg transition-all duration-200 border border-white/20"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Progress Steps */}
        <div className="mt-8 flex justify-center bg-transparent">
          <div className="flex items-center space-x-2 bg-transparent">
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

