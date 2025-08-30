import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import Loader from "../components/Loader";

const QuizResultPage = () => {
  const { attemptID } = useParams();
  const { backendUrl } = useContext(AppContext);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/quiz/attempt/${attemptID}`, { withCredentials: true });
        data.success ? setResult(data) : toast.error(data.message);
      } catch (err) {
        toast.error(err.message);
      }
    };
    fetchResult();
  }, [backendUrl, attemptID]);

  if (!result) return (
    <div>
      <Loader label="Fetching results..." />
    </div>
  );

  const { score, total, answers, questions } = result;

  return (
    <div>
      <Navbar />
      <div className="w-full max-w-3xl mx-auto p-6">
        <h1 className="font-monts font-bold text-4xl text-white px-8 py-4 rounded-full bg-[#2A4674] mt-10">Result: {score}/{total}</h1>
        <div className="mt-6 grid gap-4">
          {questions.map((q, idx) => {
            const ans = answers.find((a) => a.questionIndex === idx);
            const correct = q.answer;
            return (
              <div key={idx} className="border-2 border-[#2A4674] rounded-2xl p-5">
                <h3 className="font-bold">Q{idx + 1}. {q.questionText}</h3>
                <p className="mt-2"><span className="font-semibold">Your answer:</span> {ans?.selectedOption || "—"}</p>
                <p><span className="font-semibold">Correct answer:</span> {correct}</p>
                <p className={`mt-2 ${ans?.isCorrect?"text-green-600":"text-red-600"}`}>{ans?.isCorrect?"Correct":"Incorrect"}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;


