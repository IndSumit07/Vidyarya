import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import "../index.css";

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn, userData, isLoggedIn } =
    useContext(AppContext);

  const [state, setState] = useState("Log In");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // 🔹 default role
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      axios.defaults.withCredentials = true;

      if (state === "Sign Up") {
        const { data } = await axios.post(backendUrl + "/api/auth/register", {
          name,
          email,
          password,
          role, // 🔹 send role
        });

        if (data.success) {
          setIsLoggedIn(true);
          location.reload();
          navigate("/");
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/auth/login", {
          email,
          password,
        });

        if (data.success) {
          toast.success(data.message);
          setIsLoggedIn(true);
          navigate("/");
          location.reload();
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn && userData && navigate("/");
  }, [isLoggedIn, userData]);

  return (
    <div
      className="relative min-h-screen min-w-full flex items-center justify-center overflow-hidden px-5"
      style={{ backgroundColor: "#F5F5EF" }}
    >
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-gray-500 border-t-white rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-200 font-semibold">Processing...</p>
        </div>
      )}

      <div
        key={state}
        className={`relative bg-[#2A4674]/90 backdrop-blur-xl border border-white/20 shadow-2xl p-10 rounded-3xl w-full sm:w-[400px] z-10 animate-fadeUp ${
          loading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div className="flex flex-col items-center mb-6 bg-transparent">
          <div className="w-16 h-16 bg-[#2A4674] rounded-full flex items-center justify-center shadow-lg border border-white/20">
            <img
              src={assets.person_icon}
              alt="User"
              className="w-8 h-8 invert bg-transparent"
            />
          </div>
          <span className="mt-2 text-xl font-extrabold text-white tracking-wide bg-transparent">
            Vidyarya
          </span>
        </div>

        <h2 className="text-2xl font-bold text-white mt-2 text-center">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>
        <p className="text-gray-400 text-sm mb-6 text-center">
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account"}
        </p>

        <form onSubmit={onSubmitHandler} className="space-y-4 bg-transparent">
          {state === "Sign Up" && (
            <>
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-white/20 rounded-xl bg-[#2A4674] text-gray-200 focus:bg-[#152b50] outline-none focus:ring-2 focus:ring-gray-500 transition-all shadow-sm"
                required
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="text"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-white/20 rounded-xl bg-[#2A4674] text-gray-200 placeholder-gray-500 focus:bg-[#152b50] outline-none focus:ring-2 focus:ring-gray-500 transition-all shadow-sm"
                required
              />

              {/* 🔹 Role Selector */}
              
            </>
          )}

          <input
            type="email"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 border border-white/20 rounded-xl bg-[#2A4674] text-gray-200 placeholder-gray-500 focus:bg-[#152b50] outline-none focus:ring-2 focus:ring-gray-500 transition-all shadow-sm"
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 border border-white/20 rounded-xl bg-[#2A4674] text-gray-200 placeholder-gray-500 focus:bg-[#152b50] outline-none focus:ring-2 focus:ring-gray-500 transition-all shadow-sm"
            required
          />

          <p
            onClick={() => !loading && navigate("/forgot-password")}
            className="text-gray-400 text-sm cursor-pointer hover:underline hover:text-gray-200 transition"
          >
            Forgot password?
          </p>

          <button
            disabled={loading}
            className="w-full py-2 bg-[#152b50] hover:bg-[#2A4674] text-white font-semibold rounded-xl shadow-lg transition-all duration-200 border border-white/20"
          >
            {loading
              ? "Please wait..."
              : state === "Sign Up"
              ? "Register"
              : "Login"}
          </button>
        </form>

        {state === "Sign Up" ? (
          <p className="mt-4 text-sm text-gray-400 text-center">
            Already have an account?{" "}
            <span
              onClick={() => !loading && setState("Login")}
              className="text-white cursor-pointer bg-transparent underline hover:text-gray-300 transition"
            >
              Login here
            </span>
          </p>
        ) : (
          <p className="mt-4 text-sm text-gray-400 text-center">
            Don't have an account?{" "}
            <span
              onClick={() => !loading && setState("Sign Up")}
              className="text-white cursor-pointer underline hover:text-gray-300 transition bg-transparent"
            >
              Sign Up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
