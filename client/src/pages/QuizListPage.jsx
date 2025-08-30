import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import quizaddbg from "../../public/quizaddbg.png"

const QuizListPage = () => {
  const { backendUrl } = useContext(AppContext);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(backendUrl + "/api/quiz/list", { withCredentials: true });
        data.success ? setQuizzes(data.quizzes) : toast.error(data.message);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [backendUrl]);

  return (
    <div style={{ backgroundImage: `url(${quizaddbg})` }} className="h-[calc(100vh-80px)] w-full bg-cover bg-start bg-no-repeat">
      <div className="w-full min-h-[calc(100vh-80px)] max-w-5xl mx-auto p-6 bg-transparent ">
      <div className="text-center bg-transparent text-white mt-14 text-6xl font-monts font-black text-outline ">
        Join <span className="bg-transparent text-yellow-500">Quiz</span>
      </div>
        {loading ? (
          <Loader label="Loading quizzes..." />
        ) : quizzes.length === 0 ? (
          <div className="mt-10 text-center text-gray-400 bg-transparent">No quizzes available yet. Create one from Generate Quiz or check back later.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 bg-transparent">
            {quizzes.map((q) => (
              <div key={q._id} className="border-2 border-[#2A4674] rounded-2xl p-5">
                <h3 className="font-bold text-xl">{q.name}</h3>
                <p className="text-gray-600">{q.subject}</p>
                <div className="mt-4">
                  <Link to={`/quiz/${q._id}`} className="px-4 py-2 bg-[#2A4674] text-white rounded-full">Start</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizListPage;


