import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      alert("Account created! Please login.");
      navigate('/');
    } else {
      alert("Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <div className="bg-dark-surface p-8 rounded-2xl border border-gray-800 w-full max-w-md">
        <h1 className="text-3xl font-bold text-neon-green mb-6 text-center">Join Prepify</h1>
        <form onSubmit={handleRegister} className="space-y-4">
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
          <button className="w-full bg-neon-green text-black font-bold py-3 rounded">Sign Up</button>
        </form>
        <Link to="/" className="block text-center mt-4 text-gray-400">Back to Login</Link>
      </div>
    </div>
  );
}