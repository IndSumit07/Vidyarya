import React, { useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import quizbg from "../../public/quizbg.png"

const GenerateQuizPage = () => {
  const { backendUrl } = useContext(AppContext);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [numQuestions, setNumQuestions] = useState("");
  const [topicList, setTopicList] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !subject || !numQuestions) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        backendUrl + "/api/quiz/generate",
        {
          name,
          description,
          isActive,
          isPrivate,
          topicList: topicList.split(",").map((t) => t.trim()), // convert CSV -> array
          subject,
          numQuestions,
        },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Quiz generated successfully!");
        setName("");
        setDescription("");
        setSubject("");
        setNumQuestions("");
        setTopicList("");
        setIsActive(true);
        setIsPrivate(false);
        // Redirect to quizzes page after a short delay
        setTimeout(() => {
          navigate("/quizzes");
        }, 1500);
      } else {
        toast.error(data.message || "Failed to generate quiz");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundImage: `url(${quizbg})` }} className="min-h-[calc(100vh-80px)] h-auto w-full bg-cover bg-start bg-no-repeat flex justify-center items-center flex-col">
      <div className="w-[550px] min-h-[calc(100vh-80px)] flex flex-col justify-start items-center bg-transparent py-10">
        <div className="text-center bg-transparent text-white mt-14 text-7xl font-monts font-black text-outline ">
        Add <span className="bg-transparent text-yellow-500">Quiz</span>
      </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 w-[90%] max-w-2xl flex flex-col gap-6  py-8 rounded-2xl"
        >
          {/* Name + Num Questions */}
          <div className="flex gap-5">
            <input
              className="px-5 py-4 w-[65%] border-[#2A4674] border-2 rounded-full focus:outline-none"
              type="text"
              placeholder="Enter Quiz Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="px-5 py-4 w-[35%] border-[#2A4674] border-2 rounded-full focus:outline-none"
              type="number"
              placeholder="Num Questions"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
            />
          </div>

          {/* Subject */}
          <input
            className="px-5 py-4 w-full border-[#2A4674] border-2 rounded-full focus:outline-none"
            type="text"
            placeholder="Enter Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          {/* Topics */}
          <input
            className="px-5 py-4 w-full border-[#2A4674] border-2 rounded-full focus:outline-none"
            type="text"
            placeholder="Enter Topics (comma separated)"
            value={topicList}
            onChange={(e) => setTopicList(e.target.value)}
          />

          {/* Description */}
          <textarea
            className="px-5 py-4 w-full border-[#2A4674] border-2 rounded-2xl focus:outline-none resize-none"
            rows={4}
            placeholder="Enter Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>

          {/* Toggles */}
          <div className="flex items-center justify-between gap-5">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => setIsActive(!isActive)}
              />
              <span className="text-gray-700 font-semibold">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={() => setIsPrivate(!isPrivate)}
              />
              <span className="text-gray-700 font-semibold">Private</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-4 mt-6 bg-[#2A4674] text-white rounded-full font-bold text-lg hover:bg-[#1E3252] transition-all disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Quiz"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GenerateQuizPage;
