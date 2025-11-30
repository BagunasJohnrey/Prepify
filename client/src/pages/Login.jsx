import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <div className="bg-dark-surface p-8 rounded-2xl border border-gray-800 w-full max-w-md">
        <h1 className="text-3xl font-bold text-neon-blue mb-6 text-center">Login to Prepify</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="text" placeholder="Username"
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded text-white"
            onChange={e => setFormData({...formData, username: e.target.value})}
          />
          <input 
            type="password" placeholder="Password"
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded text-white"
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
          <button className="w-full bg-neon-blue text-black font-bold py-3 rounded">Enter</button>
        </form>
        <p className="text-gray-400 mt-4 text-center">
          New? <Link to="/register" className="text-neon-purple">Create Account</Link>
        </p>
      </div>
    </div>
  );
}