import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; 

export default function Input({ label, error, type, ...props }) {
  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);
  
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-gray-400 text-xs font-bold uppercase mb-1 tracking-wider">
          {label}
        </label>
      )}
      <div className="relative"> 
        <input
          type={inputType} // Use dynamic inputType
          className={`w-full p-3 bg-gray-900 border rounded-xl text-white outline-none transition-all ${isPassword ? 'pr-12' : ''}
            ${error 
              ? 'border-red-500 focus:border-red-500' 
              : 'border-gray-700 focus:border-neon-blue'
            }
          `}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}