import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const percentage = state ? Math.round((state.score / state.total) * 100) : 0;
  const passed = state ? percentage >= 60 : false;

  useEffect(() => {
    if (state && passed) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults, 
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults, 
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [passed, state]);

  if (!state) return <div className="text-white text-center p-10">No Result Data</div>;

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className={`text-6xl font-black mb-2 ${passed ? 'text-neon-green' : 'text-red-500'}`}>
          {passed ? 'PASSED' : 'FAILED'}
        </h1>
        <p className="text-gray-400 tracking-widest uppercase">Score: {percentage}%</p>
      </div>

      <div className="bg-dark-surface p-8 rounded-3xl border border-gray-800 shadow-2xl mb-8">
        <h2 className="text-xl font-bold mb-6 text-white border-b border-gray-800 pb-4">Performance Analysis</h2>
        <div className="space-y-6">
          {state.history.map((item, idx) => (
            <div key={idx} className="flex gap-4">
              <div className={`mt-1 min-w-6 ${item.isCorrect ? 'text-neon-green' : 'text-red-500'}`}>
                {item.isCorrect ? '✔' : '✖'}
              </div>
              <div>
                <p className="text-gray-200 font-medium">{item.question}</p>
                <div className="text-sm mt-2 flex gap-4">
                  <span className={item.isCorrect ? 'text-neon-green' : 'text-red-400'}>
                    You: {item.selected}
                  </span>
                  {!item.isCorrect && (
                    <span className="text-gray-500">Correct: {item.correct}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 italic">{item.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-8 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition font-bold">
          <Home size={20} /> Dashboard
        </button>
      </div>
    </div>
  );
}