import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, BookOpen, Heart, Settings, PlayCircle, Loader, Trash2, LogOut } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  
  // FIX: Removed 'category'. Added 'course', 'difficulty', 'description'.
  const [config, setConfig] = useState({ 
    course: 'Major Subject', 
    difficulty: 'Medium',    
    numQuestions: 15, 
    customTitle: '',
    description: ''          
  });

  const [quizzes, setQuizzes] = useState([]);
  const [hearts, setHearts] = useState(3);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setHearts(storedUser.hearts);
    }

    fetch('http://localhost:3000/api/auth/me', { 
      headers: { Authorization: `Bearer ${token}` } 
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => {
        setHearts(data.hearts);
        setUser(data); 
        localStorage.setItem('user', JSON.stringify(data));
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/');
      });
  }, [navigate]);

  // FIX: Using 'course' instead of 'category'
  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/quizzes?course=${config.course}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setQuizzes(data);
    } catch (err) {
      console.error("Failed to fetch quizzes", err);
    }
  }, [config.course]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const handleGenerate = async () => {
    if (!file) return alert("Please upload a PDF file first.");
    if (!config.customTitle.trim()) return alert("Please enter a name for this exam.");
    
    setLoading(true);

    const formData = new FormData();
    formData.append('pdfFile', file);
    
    // FIX: Only appending new fields
    formData.append('course', config.course);
    formData.append('difficulty', config.difficulty);
    formData.append('description', config.description);
    formData.append('numQuestions', config.numQuestions);
    formData.append('customTitle', config.customTitle);

    try {
      const res = await fetch('http://localhost:3000/api/generate', { 
        method: 'POST', 
        body: formData 
      });
      
      if (!res.ok) throw new Error("Generation Failed");
      
      const data = await res.json();
      alert(`Success! "${data.title}" is ready.`);
      fetchQuizzes();
      setFile(null); 
    } catch (err) {
      console.error(err);
      alert("Error generating quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, quizId) => {
    e.stopPropagation(); 
    if (!confirm("Are you sure you want to delete this quiz? This cannot be undone.")) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:3000/api/quiz/${quizId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
            alert("Quiz deleted.");
            fetchQuizzes(); 
        } else {
            alert("Failed to delete. You might not be an admin.");
        }
    } catch (err) {
        console.error("Delete error", err);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-neon-green to-neon-blue drop-shadow-lg">
            PREPIFY
          </h1>
          <div className="text-gray-400 tracking-widest text-sm font-bold mt-1 flex items-center gap-2">
            AI EXAM SIMULATOR {user && <span className="text-neon-purple">• WELCOME, {user.username.toUpperCase()} {user.role === 'admin' && '(ADMIN)'}</span>}
          </div>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-800/80 backdrop-blur-md px-6 py-3 rounded-full border border-gray-700 shadow-neon-blue">
            <Heart className={`w-6 h-6 ${hearts > 0 ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
            <div className="flex flex-col">
                <span className="text-2xl font-bold leading-none">{hearts} / 3</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Lives</span>
            </div>
            </div>

            <button 
                onClick={handleLogout}
                className="bg-red-900/20 hover:bg-red-900/40 text-red-500 p-3 rounded-full border border-red-900/50 transition"
                title="Logout"
            >
                <LogOut size={24} />
            </button>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        
        <div className="md:col-span-4 space-y-6">
          <div className="bg-dark-surface p-6 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-neon-blue to-neon-purple"></div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Settings className="text-neon-blue" /> Configuration
            </h2>
            <div className="space-y-5">
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Exam Name</label>
                <input type="text" placeholder="e.g. Finals Review" value={config.customTitle}
                  onChange={(e) => setConfig({...config, customTitle: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:border-neon-blue focus:outline-none transition" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Subject Description</label>
                <textarea 
                  rows="2"
                  placeholder="e.g. Focus on Chapter 3, specifically boolean algebra." 
                  value={config.description}
                  onChange={(e) => setConfig({...config, description: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:border-neon-blue focus:outline-none transition resize-none" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Item Count</label>
                  <span className="text-neon-green font-mono font-bold">{config.numQuestions}</span>
                </div>
                <input type="range" min="5" max="50" step="1" value={config.numQuestions}
                  onChange={(e) => setConfig({...config, numQuestions: e.target.value})}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neon-green" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Difficulty</label>
                  <select value={config.difficulty} onChange={(e) => setConfig({...config, difficulty: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:border-neon-purple outline-none">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Course Type</label>
                  <select value={config.course} onChange={(e) => setConfig({...config, course: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:border-neon-purple outline-none">
                    <option value="General Education">GED</option>
                    <option value="Minor Subject">Minor Sub</option>
                    <option value="Major Subject">Major Sub</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-dark-surface p-6 rounded-3xl border border-gray-800 shadow-xl group hover:border-neon-green transition-colors">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Upload className="text-neon-green" /> Upload Content
            </h2>
            <div className="border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center relative hover:bg-gray-800/50 transition">
              <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="text-gray-400 group-hover:text-white transition">
                <p className="text-sm font-medium mb-1">{file ? <span className="text-neon-green">{file.name}</span> : "Drop PDF File Here"}</p>
                <p className="text-xs text-gray-600">Max size 5MB</p>
              </div>
            </div>
            <button onClick={handleGenerate} disabled={loading}
              className={`w-full mt-4 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg ${loading ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-linear-to-r from-neon-blue to-blue-600 text-black hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]'}`}>
              {loading ? <><Loader className="animate-spin" /> Generating...</> : 'Generate Exam'}
            </button>
          </div>
        </div>

        <div className="md:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <BookOpen className="text-neon-purple" /> My Library
            </h2>
            <span className="text-xs font-mono text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">{quizzes.length} Files</span>
          </div>

          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <div key={quiz.id} onClick={() => navigate(`/quiz/${quiz.id}`)}
                className="group bg-dark-surface p-5 rounded-2xl border border-gray-800 hover:border-neon-purple transition-all cursor-pointer flex justify-between items-center shadow-lg hover:shadow-[0_0_15px_rgba(188,19,254,0.1)]">
                <div>
                  <h3 className="font-bold text-lg text-white group-hover:text-neon-purple transition">{quiz.title}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-900 text-gray-400 px-2 py-1 rounded border border-gray-700">{quiz.items_count || 10} Qs</span>
                    {/* Display New Fields */}
                    <span className="text-xs text-gray-500">{quiz.course} • <span className="text-neon-blue">{quiz.difficulty}</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    {user?.role === 'admin' && (
                        <button onClick={(e) => handleDelete(e, quiz.id)} className="bg-red-900/30 p-3 rounded-full hover:bg-red-600 hover:text-white text-red-500 transition border border-red-900/50" title="Delete Quiz">
                            <Trash2 size={20} />
                        </button>
                    )}
                    <button className="bg-gray-800 p-3 rounded-full group-hover:bg-neon-purple group-hover:text-black transition">
                      <PlayCircle size={24} />
                    </button>
                </div>
              </div>
            ))}
            {quizzes.length === 0 && (
              <div className="text-center py-20 bg-dark-surface border border-gray-800 rounded-3xl border-dashed">
                <p className="text-gray-500 mb-2">Your library is empty.</p>
                <p className="text-neon-blue text-sm cursor-pointer" onClick={() => document.querySelector('input[type=file]').click()}>Upload a PDF to start!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}