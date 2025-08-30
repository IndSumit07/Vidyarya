import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import Loader from "../components/Loader";

const PlayQuizPage = () => {
  const { quizID } = useParams();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  const [questions, setQuestions] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/quiz/${quizID}`, { withCredentials: true });
        if (data.success) {
          setQuiz(data.quiz);
          setQuestions(data.questions || []);
        } else toast.error(data.message);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [backendUrl, quizID]);

  const onSelect = (option) => {
    setAnswers({ ...answers, [currentIndex]: option });
  };

  const next = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
  };
  const prev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const submit = async () => {
    try {
      setSubmitting(true);
      const payload = {
        answers: Object.entries(answers).map(([idx, selectedOption]) => ({
          questionIndex: Number(idx),
          selectedOption,
        })),
      };
      const { data } = await axios.post(`${backendUrl}/api/quiz/${quizID}/submit`, payload, { withCredentials: true });
      if (data.success) {
        navigate(`/quiz/attempt/${data.attemptId}`);
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const q = questions[currentIndex];

  return (
    <div>
      <div className="w-full min-h-[calc(100vh-80px)] max-w-3xl mx-auto p-6">
        {loading ? (
          <Loader label="Preparing quiz..." />
        ) : q ? (
          <div className="border-2 border-[#2A4674] rounded-2xl p-6 mt-10">
            <h2 className="font-bold text-2xl">Q{currentIndex + 1}. {q.questionText}</h2>
            <div className="mt-6 grid gap-3">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  className={`text-left px-4 py-3 rounded-full border-2 ${answers[currentIndex] === opt ? "bg-[#2A4674] text-white border-[#2A4674]" : "border-[#2A4674]"}`}
                  onClick={() => onSelect(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={prev} disabled={currentIndex===0} className="px-4 py-2 rounded-full border-2 border-[#2A4674]">Prev</button>
              {currentIndex === questions.length - 1 ? (
                <button onClick={submit} disabled={submitting} className="px-6 py-2 rounded-full bg-[#2A4674] text-white">{submitting?"Submitting...":"Submit"}</button>
              ) : (
                <button onClick={next} className="px-6 py-2 rounded-full bg-[#2A4674] text-white">Next</button>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-10">Loading...</p>
        )}
      </div>
    </div>
  );
};

export default PlayQuizPage;


