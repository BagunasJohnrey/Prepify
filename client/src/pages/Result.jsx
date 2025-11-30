import { useLocation, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <div className="text-white text-center p-10">No Result Data</div>;

  const percentage = Math.round((state.score / state.total) * 100);
  const passed = percentage >= 60;

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
        <button onClick={() => navigate('/')} className="flex items-center gap-2 px-8 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition font-bold">
          <Home size={20} /> Dashboard
        </button>
      </div>
    </div>
  );
}