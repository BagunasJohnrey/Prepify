import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-bg p-6 text-center">
      <div className="bg-dark-surface p-10 rounded-3xl border border-gray-800 shadow-2xl max-w-md w-full flex flex-col items-center">
        <div className="bg-gray-900/50 p-6 rounded-full mb-6 border border-gray-800">
            <FileQuestion size={60} className="text-neon-purple" />
        </div>
        
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-neon-blue to-neon-purple mb-2">
            404
        </h1>
        <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
        
        <p className="text-gray-400 mb-8 leading-relaxed">
          Oops! Are you lost baby gurl? bawal pa dito ginagawa pa.
        </p>
        
        <Button 
          onClick={() => navigate('/dashboard')} 
          variant="primary"
        >
          <Home size={20} />
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}