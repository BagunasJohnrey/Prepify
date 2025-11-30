export default function Input({ label, error, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-gray-400 text-xs font-bold uppercase mb-1 tracking-wider">
          {label}
        </label>
      )}
      <input
        className={`w-full p-3 bg-gray-900 border rounded-xl text-white outline-none transition-all
          ${error 
            ? 'border-red-500 focus:border-red-500' 
            : 'border-gray-700 focus:border-neon-blue'
          }
        `}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}