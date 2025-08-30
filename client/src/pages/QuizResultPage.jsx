import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import Loader from "../components/Loader";
import quizaddbg from "../../public/quizaddbg.png";

const QuizResultPage = () => {
  const { attemptID } = useParams();
  const { backendUrl } = useContext(AppContext);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/quiz/attempt/${attemptID}`,
          { withCredentials: true }
        );
        data.success ? setResult(data) : toast.error(data.message);
      } catch (err) {
        toast.error(err.message);
      }
    };
    fetchResult();
  }, [backendUrl, attemptID]);

  if (!result)
    return (
      <div>
        <Loader label="Fetching results..." />
      </div>
    );

  const { score, total, answers, questions } = result;

  return (
    <div
      style={{ backgroundImage: `url(${quizaddbg})` }}
      className="h-[calc(100vh-80px)] w-full bg-cover bg-start bg-no-repeat overflow-hidden"
    >
      <div className="w-full max-w-3xl mx-auto p-6 bg-transparent">
        {/* Title */}
        <div className="text-center bg-transparent text-white mt-14 text-6xl font-monts font-black text-outline">
          Quiz <span className="bg-transparent text-yellow-500">Result</span>
        </div>

        {/* Result Summary */}
        <div className="mt-8 flex justify-center items-center gap-6 text-white font-monts bg-transparent">
          <div className="text-3xl font-bold bg-transparent text-white">
            Score:{" "}
            <span className="text-yellow-400 bg-transparent">
              {score}
            </span>
            /{total}
          </div>
          <div
            className={`text-2xl font-semibold bg-transparent ${
              score >= total / 2 ? "text-green-400" : "text-red-400"
            }`}
          >
            {score >= total / 2 ? "Well Done 🎉" : "Keep Practicing 💪"}
          </div>
        </div>

        {/* Questions Review */}
        <div className="mt-6 bg-transparent max-h-[500px] overflow-y-auto pr-2 pb-10">
          <div className="grid gap-4 bg-transparent pb-20 pt-10">
            {questions.map((q, idx) => {
              const ans = answers.find((a) => a.questionIndex === idx);
              const correct = q.answer;
              return (
                <div
                  key={idx}
                  className="border-2 border-[#2A4674] rounded-2xl p-5 bg-white/80"
                >
                  <h3 className="font-bold text-[#2A4674] bg-transparent">
                    Q{idx + 1}. {q.questionText}
                  </h3>
                  <p className="mt-2">
                    <span className="font-semibold bg-transparent">Your answer:</span>{" "}
                    {ans?.selectedOption || "—"}
                  </p>
                  <p>
                    <span className="font-semibold bg-transparent">Correct answer:</span>{" "}
                    {correct}
                  </p>
                  <p
                    className={`mt-2 ${
                      ans?.isCorrect ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {ans?.isCorrect ? "Correct" : "Incorrect"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;
