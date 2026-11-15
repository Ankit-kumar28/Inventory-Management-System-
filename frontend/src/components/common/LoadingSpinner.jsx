export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };
  return (
    <div
      className={`${sizes[size]} ${className} border-slate-200 border-t-accent-600 rounded-full animate-spin`}
    />
  );
}

export function PageLoader({ text = 'Loading data...' }) {
  return (
    <div className="flex items-center justify-center min-h-[360px]">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{text}</p>
      </div>
    </div>
  );
}
