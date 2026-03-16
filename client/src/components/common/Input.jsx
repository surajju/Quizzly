export default function Input({
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white/80 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 rounded-lg
          bg-white/5 border border-white/20
          backdrop-blur-sm
          text-white placeholder-white/40
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
          transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500/50' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}
