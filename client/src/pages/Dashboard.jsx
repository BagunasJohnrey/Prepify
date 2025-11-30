import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, BookOpen, Sparkles, PlayCircle } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("College");
  const [program, setProgram] = useState("BSIT");
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState([]);

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/quizzes?category=${category}&program=${program}`);
      if (!res.ok) throw new Error("Failed to connect");
      const data = await res.json();
      setQuizzes(data);
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
    }
  }, [category, program]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleGenerate = async () => {
    if (!file) return alert("Please select a PDF file first.");
    setLoading(true);

    const formData = new FormData();
    formData.append('pdfFile', file);
    formData.append('category', category);
    formData.append('program', program);

    try {
      const res = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        body: formData
      });

      // --- FIX: Check for error response ---
      if (!res.ok) {
        throw new Error("Server Error");
      }

      const data = await res.json();
      alert(`Success! Generated: ${data.title}`);
      fetchQuizzes(); 
    } catch (err) {
      console.error(err);
      alert("Error generating quiz. Please check the backend console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      <header className="text-center mb-16 relative">
        <div className="absolute inset-0 bg-neon-blue blur-[100px] opacity-10 pointer-events-none"></div>
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-linear-to-r from-neon-green via-neon-blue to-neon-purple drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
          PREPIFY
        </h1>
        <p className="text-gray-400 tracking-[0.3em] mt-4 uppercase text-sm font-bold">
          AI-Powered Exam Simulation
        </p>
      </header>

      <div className="grid md:grid-cols-12 gap-8 relative z-10">
        <div className="md:col-span-4 space-y-6">
          <div className="bg-dark-surface p-6 rounded-2xl border border-gray-800 shadow-2xl backdrop-blur-sm">
            <h2 className="text-xl font-bold text-neon-blue mb-6 flex items-center gap-2">
              <Sparkles size={20} /> Setup
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-bold">LEVEL</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-neon-blue outline-none transition"
                >
                  <option value="High School">High School</option>
                  <option value="Senior High">Senior High</option>
                  <option value="College">College</option>
                </select>
              </div>
              {category === "College" && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1 font-bold">PROGRAM</label>
                  <select 
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-neon-blue outline-none transition"
                  >
                    <option value="BSIT">BSIT</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Nursing">Nursing</option>
                    <option value="Education">Education</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="bg-dark-surface p-6 rounded-2xl border border-gray-800 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Upload size={20} /> Generate New
            </h2>
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-neon-green hover:bg-gray-800/50 transition cursor-pointer relative group">
              <input 
                type="file" 
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="text-gray-400 group-hover:text-white transition">
                <p className="text-sm font-medium">
                  {file ? file.name : "Drop PDF Lecture Notes Here"}
                </p>
              </div>
            </div>
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full mt-4 font-bold py-3 rounded-xl transition shadow-lg ${loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-linear-to-r from-neon-blue to-blue-600 text-black hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]'}`}
            >
              {loading ? "Analyzing Content..." : "Generate Exam"}
            </button>
          </div>
        </div>

        <div className="md:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <BookOpen className="text-neon-purple" />
              Available Simulations
            </h2>
            <span className="bg-gray-800 text-xs px-3 py-1 rounded-full border border-gray-700 text-gray-400">
              {quizzes.length} Found
            </span>
          </div>
          
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="group bg-dark-surface p-5 rounded-xl border border-gray-800 hover:border-neon-purple transition flex justify-between items-center cursor-pointer shadow-md hover:shadow-[0_0_15px_rgba(188,19,254,0.15)]">
                <div>
                  <h3 className="font-bold text-lg text-white group-hover:text-neon-purple transition">{quiz.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] uppercase tracking-wider bg-gray-900 text-gray-400 px-2 py-1 rounded border border-gray-700">{quiz.category}</span>
                    <span className="text-[10px] uppercase tracking-wider bg-gray-900 text-gray-400 px-2 py-1 rounded border border-gray-700">{quiz.program}</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/quiz/${quiz.id}`)}
                  className="bg-gray-800 p-3 rounded-full group-hover:bg-neon-purple group-hover:text-black transition"
                >
                  <PlayCircle size={24} />
                </button>
              </div>
            ))}
            
            {quizzes.length === 0 && (
              <div className="text-center py-20 bg-dark-surface border border-gray-800 rounded-2xl border-dashed">
                <p className="text-gray-500 mb-2">No quizzes found for this category.</p>
                <p className="text-neon-blue text-sm">Upload a PDF to generate one!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}