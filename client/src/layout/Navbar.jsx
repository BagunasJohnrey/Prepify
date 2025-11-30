import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if(confirm("Log out?")) {
      logout();
      setIsOpen(false);
      navigate('/');
    }
  };

  const isActive = (path) => location.pathname === path ? 'text-neon-blue' : 'text-gray-300 hover:text-white';

  return (
    <nav className="sticky top-0 z-50 bg-dark-bg/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <span className="text-neon-blue">PREP</span>IFY
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 font-medium text-sm">
          <Link to="/" className={`${isActive('/')} transition`}>Home</Link>
          <Link to="/about" className={`${isActive('/about')} transition`}>About</Link>
          {user && <Link to="/dashboard" className={`${isActive('/dashboard')} transition`}>Dashboard</Link>}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm flex items-center gap-2">
                <User size={16} /> {user.username}
              </span>
              <button 
                onClick={handleLogout}
                className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition border border-gray-700"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link to="/" className="text-gray-300 hover:text-white px-4 py-2 text-sm font-bold">Login</Link>
              <Link to="/register" className="bg-neon-blue text-black hover:bg-[#00d4ff] px-5 py-2 rounded-full text-sm font-bold transition shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-dark-surface border-b border-gray-800 p-6 flex flex-col gap-4 shadow-2xl animate-fade-in-down">
          <Link to="/" className="text-white py-2" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/about" className="text-white py-2" onClick={() => setIsOpen(false)}>About</Link>
          {user && <Link to="/dashboard" className="text-white py-2" onClick={() => setIsOpen(false)}>Dashboard</Link>}
          
          <div className="border-t border-gray-700 pt-4 mt-2">
            {user ? (
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 w-full py-2">
                <LogOut size={18} /> Log Out
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                 <Link to="/" className="text-center text-white border border-gray-700 py-3 rounded-xl" onClick={() => setIsOpen(false)}>Login</Link>
                 <Link to="/register" className="text-center bg-neon-blue text-black py-3 rounded-xl font-bold" onClick={() => setIsOpen(false)}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}