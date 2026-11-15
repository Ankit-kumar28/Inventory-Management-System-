import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle2 className="w-4 h-4 text-success-600 shrink-0" />,
  error: <XCircle className="w-4 h-4 text-danger-600 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-warning-600 shrink-0" />,
  info: <Info className="w-4 h-4 text-accent-600 shrink-0" />,
};

const borderStyles = {
  success: 'border-l-4 border-l-success-500',
  error: 'border-l-4 border-l-danger-500',
  warning: 'border-l-4 border-l-warning-500',
  info: 'border-l-4 border-l-accent-500',
};

export function ToastContainer({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`card pointer-events-auto flex items-start gap-3 p-3.5 shadow-lg bg-white border border-slate-200 ${borderStyles[t.type] || borderStyles.info}`}
        >
          {icons[t.type] || icons.info}
          <div className="flex-1 text-xs text-slate-800 font-medium leading-relaxed">
            {t.message}
          </div>
          <button
            onClick={() => onRemove(t.id)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
