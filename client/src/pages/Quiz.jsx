import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Timer, AlertCircle } from 'lucide-react';

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [selected, setSelected] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [history, setHistory] = useState([]);

  // --- FIX: Wrapped in useCallback to prevent infinite render loops ---
  const handleFinish = useCallback(() => {
    if (!quiz) return;
    navigate('/result', { 
      state: { 
        score, 
        total: quiz.questions.length, 
        history, 
        title: quiz.title 
      } 
    });
  }, [quiz, score, history, navigate]);

  // Fetch Quiz Data
  useEffect(() => {
    fetch(`http://localhost:3000/api/quiz/${id}`)
      .then(res => res.json())
      .then(data => {
        // Randomize questions
        const shuffled = { ...data, questions: data.questions.sort(() => Math.random() - 0.5) };
        setQuiz(shuffled);
      })
      .catch(err => console.error("Failed to load quiz", err));
  }, [id]);

  // Timer Logic
  useEffect(() => {
    if (!quiz) return; 

    if (timeLeft > 0 && !isAnswered) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleFinish(); 
    }
  }, [timeLeft, isAnswered, quiz, handleFinish]); 

  const handleAnswer = (option) => {
    setSelected(option);
    setIsAnswered(true);
    const correct = quiz.questions[currentQ].answer;
    
    if (option === correct) setScore(s => s + 1);

    setHistory(prev => [...prev, {
      question: quiz.questions[currentQ].question,
      selected: option,
      correct,
      explanation: quiz.questions[currentQ].explanation,
      isCorrect: option === correct
    }]);
  };

  const handleNext = () => {
    if (currentQ + 1 < quiz.questions.length) {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setIsAnswered(false);
    } else {
      handleFinish();
    }
  };

  if (!quiz) return <div className="text-center p-10 text-neon-blue animate-pulse">Loading Simulation...</div>;

  const q = quiz.questions[currentQ];

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto flex flex-col justify-center">
      {/* HUD */}
      <div className="flex justify-between items-center mb-8 text-xl font-mono">
        <div className="text-gray-400">Question {currentQ + 1}/{quiz.questions.length}</div>
        <div className={`flex items-center gap-2 ${timeLeft < 60 ? 'text-red-500' : 'text-neon-green'}`}>
          <Timer /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-dark-surface p-8 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
          <div 
            className="h-full bg-neon-purple transition-all duration-500" 
            style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>

        <h2 className="text-2xl font-bold mb-8 text-white leading-relaxed">{q.question}</h2>

        <div className="grid gap-4">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => !isAnswered && handleAnswer(opt)}
              disabled={isAnswered}
              className={`p-4 rounded-xl text-left transition-all border-2 ${
                isAnswered
                  ? opt === q.answer
                    ? 'border-neon-green bg-green-900/20 text-neon-green'
                    : opt === selected
                    ? 'border-red-500 bg-red-900/20 text-red-500'
                    : 'border-transparent opacity-50'
                  : 'border-gray-700 hover:border-neon-blue hover:bg-gray-800'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Explanation / Next Button */}
        {isAnswered && (
          <div className="mt-8 animate-fade-in">
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 mb-4">
              <div className="flex items-center gap-2 font-bold mb-1 text-gray-300">
                <AlertCircle size={16} /> Explanation
              </div>
              <p className="text-gray-400 text-sm">{q.explanation}</p>
            </div>
            <button 
              onClick={handleNext}
              className="w-full bg-linear-to-r from-neon-blue to-blue-600 text-black font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition"
            >
              {currentQ + 1 === quiz.questions.length ? 'Finish Exam' : 'Next Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}