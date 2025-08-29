import React, { useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";

const GenerateQuizPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [numQuestions, setNumQuestions] = useState("");
  const [topicList, setTopicList] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !subject || !numQuestions) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        "http://localhost:4000/api/quiz/generate", // update backend url
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
    <div>
      <Navbar />
      <div className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-start items-center">
        <h1 className="font-monts font-bold text-5xl text-white px-8 py-4 rounded-full bg-[#2A4674] mt-10">
          Generate Quiz
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-16 w-[90%] max-w-2xl flex flex-col gap-6 shadow-lg p-8 rounded-2xl"
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
